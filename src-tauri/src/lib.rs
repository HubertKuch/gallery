mod raw;
use crate::raw::{get_preview_path_by_thumbnail, process_raw_file};
use gphoto2;
use md5;
use rayon::prelude::*;
use rexif;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::thread;
use tauri::{AppHandle, Emitter, Manager, Runtime};

#[derive(serde::Serialize, Clone)]
struct CameraDevice {
    name: String,
    port: String,
}

#[derive(serde::Serialize, Clone)]
struct CameraFile {
    name: String,
    path: String,
}

// #[tauri::command]
// async fn import_camera_files(port: String, files: Vec<String>, destination: String) -> Result<(), String> {
//     use std::path::PathBuf;
//
//     let context = gphoto2::Context::new().map_err(|e| e.to_string())?;
//
//     let cameras = context.list_cameras().wait().map_err(|e| e.to_string())?;
//
//     let camera_descriptor = cameras
//         .iter()
//         .find(|(_, addr)| *addr == port)
//         .ok_or_else(|| "Camera not found".to_string())?.0;
//
//     let mut camera = context.get_camera(camera_descriptor).wait().map_err(|e| e.to_string())?;
//
//     for file_path in files {
//         let parts: Vec<&str> = file_path.splitn(2, '/').collect();
//         if parts.len() == 2 {
//             let folder = parts[0];
//             let filename = parts[1];
//
//             let mut dest_path = PathBuf::from(&destination);
//             dest_path.push(filename);
//
//             camera.fs()
//                 .download_to(folder, filename, dest_path.as_path())
//                 .wait()
//                 .map_err(|e| e.to_string())?;
//         }
//     }
//
//     Ok(())
// }

#[tauri::command]
async fn list_cameras() -> Result<Vec<CameraDevice>, String> {
    let context = gphoto2::Context::new().map_err(|e| e.to_string())?;

    let cameras = context.list_cameras().wait().map_err(|e| e.to_string())?;

    let mut camera_devices = Vec::new();

    for camerDescriptor in cameras {
        camera_devices.push(CameraDevice {
            name: camerDescriptor.model,
            port: camerDescriptor.port,
        });
    }

    Ok(camera_devices)
}

fn is_image(path: &Path) -> bool {
    match path.extension().and_then(|s| s.to_str()) {
        Some(ext) => matches!(
            ext.to_lowercase().as_str(),
            "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "cr2" | "nef" | "arw"
        ),
        None => false,
    }
}

#[cold]
fn create_new_thumbnail(original_path: &str, thumbnail_path: &Path) -> Result<(), String> {
    let img = image::open(original_path)
        .map_err(|e| format!("Failed to open image: {}: {}", e, original_path))?;

    let thumbnail = img.thumbnail(400, 400);

    thumbnail
        .save_with_format(thumbnail_path, image::ImageFormat::Jpeg)
        .map_err(|e| e.to_string())
}

struct CacheDirs {
    thumbnail_dir: PathBuf,
    preview_dir: PathBuf,
}

fn create_cache_dirs<R: Runtime>(app_handle: &AppHandle<R>) -> Result<CacheDirs, String> {
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?;

    let thumbnail_dir = cache_dir.join("thumbnails");
    let preview_dir = cache_dir.join("rawpreview");

    if !thumbnail_dir.exists() {
        fs::create_dir_all(&thumbnail_dir).map_err(|e| e.to_string())?;
    }

    if !preview_dir.exists() {
        fs::create_dir_all(&preview_dir).map_err(|e| e.to_string())?;
    }

    Ok(CacheDirs {
        thumbnail_dir,
        preview_dir,
    })
}

fn process_single_thumbnail<R: Runtime>(
    original_path: &str,
    app_handle: &AppHandle<R>,
) -> Result<String, String> {
    let cache_dirs = create_cache_dirs(app_handle)?;
    let thumbnail_dir = cache_dirs.thumbnail_dir;
    let preview_dir = cache_dirs.preview_dir;

    let hash = md5::compute(original_path.as_bytes());
    let thumbnail_filename = format!("{:x}.jpg", hash);
    let thumbnail_path = thumbnail_dir.join(&thumbnail_filename);

    if !thumbnail_path.exists() {
        let path = Path::new(original_path);
        match path.extension().and_then(|s| s.to_str()) {
            Some(ext) if matches!(ext.to_lowercase().as_str(), "cr2" | "nef" | "arw") => {
                // For RAW files, the main "thumbnail" is the large preview.
                let mut preview_path = preview_dir.join(&thumbnail_filename);
                process_raw_file(original_path.to_string(), &mut preview_path)
                    .map_err(|e| e.to_string())?;
            }
            _ => {
                create_new_thumbnail(original_path, &thumbnail_path)?;
            }
        }
    };

    Ok(thumbnail_path.to_string_lossy().to_string())
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct AlbumMetadata {
    image_count: usize,
}

#[derive(serde::Serialize, Clone)]
struct ThumbnailReadyPayload {
    original: String,
    thumb: String,
}

#[tauri::command]
async fn start_album_load<R: Runtime>(album_path: String, app_handle: AppHandle<R>) {
    thread::spawn(move || {
        let image_paths: Vec<String> = if let Ok(entries) = fs::read_dir(album_path) {
            entries
                .filter_map(Result::ok)
                .filter(|entry| {
                    let path = entry.path();
                    path.is_file() && is_image(&path)
                })
                .map(|entry| entry.path().to_string_lossy().to_string())
                .collect()
        } else {
            app_handle
                .emit("album-metadata-ready", AlbumMetadata { image_count: 0 })
                .unwrap();
            app_handle
                .emit("thumbnail-generation-finished", ())
                .unwrap();
            return;
        };

        let image_count = image_paths.len();
        app_handle
            .emit("album-metadata-ready", AlbumMetadata { image_count })
            .unwrap();

        image_paths.par_iter().for_each(|path_str| {
            match process_single_thumbnail(path_str, &app_handle) {
                Ok(thumb_path) => {
                    app_handle
                        .emit(
                            "thumbnail-ready",
                            ThumbnailReadyPayload {
                                original: path_str.clone(),
                                thumb: thumb_path,
                            },
                        )
                        .unwrap();
                }
                Err(e) => {
                    eprintln!("Failed to generate thumbnail for {}: {}", path_str, e);
                }
            }
        });

        app_handle
            .emit("thumbnail-generation-finished", ())
            .unwrap();
    });
}

#[derive(serde::Serialize, Clone)]
struct ImageMetadata {
    entries: HashMap<String, String>,
}

#[tauri::command]
async fn get_image_metadata(file_path: String) -> Result<ImageMetadata, String> {
    println!("Getting metadata for {}", file_path);
    let path = Path::new(&file_path);
    let mut metadata_map = HashMap::new();

    match path.extension().and_then(|s| s.to_str()) {
        Some(ext) if matches!(ext.to_lowercase().as_str(), "cr2" | "nef" | "arw") => {}
        _ => {
            let exif_data = rexif::parse_file(&file_path)
                .map_err(|e| format!("Failed to parse EXIF data: {}", e.to_string()))?;

            for entry in exif_data.entries {
                metadata_map.insert(entry.tag.to_string(), entry.value_more_readable.to_string());
            }
        }
    }

    Ok(ImageMetadata {
        entries: metadata_map,
    })
}

#[tauri::command]
fn get_raw_preview_path_by_thumbnail(thumbnail_path: String) -> Result<String, String> {
    let preview_path_str = get_preview_path_by_thumbnail(thumbnail_path.as_str());
    let preview_path = Path::new(&preview_path_str);

    if preview_path.exists() {
        Ok(preview_path_str)
    } else {
        Err(format!("Preview file not found at: {}", preview_path_str))
    }
}

#[tauri::command]
fn invalidate_cache<R: Runtime>(app_handle: AppHandle<R>) {
    let cache_dir = app_handle.path().app_cache_dir().unwrap();

    if cache_dir.exists() {
        if let Ok(entries) = fs::read_dir(&cache_dir) {
            for entry in entries.filter_map(Result::ok) {
                let path = entry.path();
                if path.is_dir() {
                    fs::remove_dir_all(&path).unwrap_or_else(|e| eprintln!("Failed to remove directory {}: {}", path.display(), e));
                } else {
                    fs::remove_file(&path).unwrap_or_else(|e| eprintln!("Failed to remove file {}: {}", path.display(), e));
                }
            }
        }
    }
    create_cache_dirs(&app_handle).expect("Expected cache dirs to be created.");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            start_album_load,
            get_image_metadata,
            get_raw_preview_path_by_thumbnail,
            invalidate_cache,
            list_cameras
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
