use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::io::BufReader;
use std::path::{Path};
use std::thread;
use tauri::{AppHandle, Manager, Emitter, Runtime};
use rayon::prelude::*;
use rexif::ExifData;

fn is_image(path: &Path) -> bool {
    match path.extension().and_then(|s| s.to_str()) {
        Some(ext) => matches!(ext.to_lowercase().as_str(), "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp"),
        None => false,
    }
}

#[cold]
fn create_new_thumbnail(original_path: &str, thumbnail_path: &Path) -> Result<(), String> {
    let img = image::open(original_path)
        .map_err(|e| format!("Failed to open image: {}: {}", e, original_path))?;

    let thumbnail = img.thumbnail(400, 400);

    thumbnail.save_with_format(thumbnail_path, image::ImageFormat::Jpeg)
        .map_err(|e| e.to_string())
}

fn process_single_thumbnail<R: Runtime>(original_path: &str, app_handle: &AppHandle<R>) -> Result<String, String> {
    let cache_dir = app_handle.path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?;

    let thumbnail_dir = cache_dir.join("thumbnails");

    if !thumbnail_dir.exists() {
        fs::create_dir_all(&thumbnail_dir).map_err(|e| e.to_string())?;
    }

    let hash = md5::compute(original_path.as_bytes());
    let thumbnail_filename = format!("{:x}.jpg", hash);
    let thumbnail_path = thumbnail_dir.join(thumbnail_filename);

    if !thumbnail_path.exists() {
        create_new_thumbnail(original_path, &thumbnail_path)?;
    }

    Ok(thumbnail_path.to_string_lossy().to_string())
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct AlbumMetadata {
    image_count: usize,
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
            app_handle.emit("album-metadata-ready", AlbumMetadata { image_count: 0 }).unwrap();
            app_handle.emit("thumbnail-generation-finished", ()).unwrap();
            return;
        };

        let image_count = image_paths.len();
        app_handle.emit("album-metadata-ready", AlbumMetadata { image_count }).unwrap();

        image_paths.par_iter().for_each(|path_str| {
            match process_single_thumbnail(path_str, &app_handle) {
                Ok(thumb_path) => {
                    app_handle.emit("thumbnail-ready", thumb_path).unwrap();
                }
                Err(e) => {
                    eprintln!("Failed to generate thumbnail for {}: {}", path_str, e);
                }
            }
        });

        app_handle.emit("thumbnail-generation-finished", ()).unwrap();
    });
}


#[derive(serde::Serialize, Clone)]
struct ImageMetadata {
    entries: HashMap<String, String>,
}

#[tauri::command]
async fn get_image_metadata(file_path: String) -> Result<ImageMetadata, String> {
    println!("{}", file_path);
    let exif_data = rexif::parse_file(&file_path)
        .map_err(|e| format!("Failed to parse EXIF data: {}", e.to_string()))?;

    let mut metadata_map = HashMap::new();

    for entry in exif_data.entries {
        metadata_map.insert(
            entry.tag.to_string(),
            entry.value_more_readable.to_string()
        );
    }

    Ok(ImageMetadata { entries: metadata_map })
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_album_load,get_image_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
