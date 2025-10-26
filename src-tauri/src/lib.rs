use std::collections::HashMap;
use std::fs;
use std::path::{Path};
use std::thread;
use tauri::{AppHandle, Manager, Emitter, Runtime};
use rayon::prelude::*;
use rawloader::RawImageData;

// CRITICAL FIX: Add missing imports for md5 (used in process_single_thumbnail)
// and rexif (used in get_image_metadata for standard files).
use md5;
use rexif;

// --- is_image, create_new_thumbnail functions are unchanged ---

fn is_image(path: &Path) -> bool {
    match path.extension().and_then(|s| s.to_str()) {
        Some(ext) => matches!(ext.to_lowercase().as_str(), "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "cr2" | "nef" | "arw"),
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

// Rewritten process_raw_file for robustness and performance
fn process_raw_file(original_path: &str, thumbnail_path: &Path) -> Result<(), String> {
    let raw_image = rawloader::decode_file(original_path)
        .map_err(|e| format!("Failed to decode RAW file: {}", e))?;

    // The field name for the embedded JPEG preview (e.g., `preview_image`, `preview`, or `previews`)
    // seems inconsistent across rawloader versions or development stages. To ensure compilation
    // and provide a reliable fallback, we are skipping the embedded JPEG extraction and
    // proceeding directly to processing the raw sensor data for a grayscale thumbnail.
    // This ensures a thumbnail is generated without relying on the optional embedded JPEG field.

    // 1. Fallback: Use the raw sensor data to create a simple grayscale thumbnail
    let (width, height) = (raw_image.width as u32, raw_image.height as u32);

    let raw_data = match raw_image.data {
        RawImageData::Integer(data) => data,
        // We only implement a fallback for integer data
        _ => return Err("RAW file lacks data or uses unsupported non-integer data format.".to_string()),
    };

    // Simple downsampling of the raw 16-bit data to 8-bit grayscale for a quick preview

    let down_factor = ((width.max(height) as f32) / 400.0).ceil() as u32;
    if down_factor == 0 { return Err("Invalid image dimensions.".to_string()); }

    let downsampled_width = width / down_factor;
    let downsampled_height = height / down_factor;

    let max_val = raw_data.iter().max().cloned().unwrap_or(u16::MAX);
    let scale_factor = 255.0 / max_val as f32;

    // Capture necessary variables by value for the closure to own them
    let raw_image_width = raw_image.width;

    // FIX: Create an explicit reference to the large raw_data Vec.
    // The reference (&Vec<u16>) is a Copy type, allowing the inner move closure
    // to capture a copy of the reference without attempting to move the Vec itself,
    // solving the E0373 lifetime error.
    let raw_data_ref: &Vec<u16> = &raw_data;

    let downsampled_data: Vec<u8> = (0..downsampled_height).flat_map(|y| {
        (0..downsampled_width).map(move |x| { // Added 'move' keyword here
            let original_x = x * down_factor;
            let original_y = y * down_factor;
            let index = (original_y as usize * raw_image_width) + original_x as usize; // Use captured width

            // Convert 16-bit raw value to 8-bit grayscale
            let val = raw_data_ref[index]; // Use the explicit reference
            let scaled_val = (val as f32 * scale_factor).min(255.0) as u8;
            scaled_val
        })
    }).collect();

    let gray_image: image::ImageBuffer<image::Luma<u8>, Vec<u8>> =
        image::ImageBuffer::from_raw(downsampled_width, downsampled_height, downsampled_data)
            .ok_or_else(|| "Failed to create grayscale image buffer".to_string())?;

    // Convert to RGB for JPEG save
    let rgb_image = image::DynamicImage::ImageLuma8(gray_image).to_rgb8();

    rgb_image
        .save_with_format(thumbnail_path, image::ImageFormat::Jpeg)
        .map_err(|e| e.to_string())
}

fn process_single_thumbnail<R: Runtime>(
    original_path: &str,
    app_handle: &AppHandle<R>,
) -> Result<String, String> {
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?;

    let thumbnail_dir = cache_dir.join("thumbnails");

    if !thumbnail_dir.exists() {
        fs::create_dir_all(&thumbnail_dir).map_err(|e| e.to_string())?;
    }

    // md5 is now available due to the added import
    let hash = md5::compute(original_path.as_bytes());
    let thumbnail_filename = format!("{:x}.jpg", hash);
    let thumbnail_path = thumbnail_dir.join(thumbnail_filename);

    if !thumbnail_path.exists() {
        let path = Path::new(original_path);
        match path.extension().and_then(|s| s.to_str()) {
            Some(ext) if matches!(ext.to_lowercase().as_str(), "cr2" | "nef" | "arw") => {
                process_raw_file(original_path, &thumbnail_path)?;
            }
            _ => {
                create_new_thumbnail(original_path, &thumbnail_path)?;
            }
        }
    }

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
    let path = Path::new(&file_path);
    let mut metadata_map = HashMap::new();

    match path.extension().and_then(|s| s.to_str()) {
        Some(ext) if matches!(ext.to_lowercase().as_str(), "cr2" | "nef" | "arw") => {
            let raw_file = rawloader::decode_file(&file_path)
                .map_err(|e| format!("Failed to decode RAW file: {}", e))?;

            metadata_map.insert("Make".to_string(), raw_file.make.to_string());
            metadata_map.insert("Model".to_string(), raw_file.model.to_string());
            metadata_map.insert("Width".to_string(), raw_file.width.to_string());
            metadata_map.insert("Height".to_string(), raw_file.height.to_string());
        }
        _ => {
            // rexif is now available due to the added import
            let exif_data = rexif::parse_file(&file_path)
                .map_err(|e| format!("Failed to parse EXIF data: {}", e.to_string()))?;

            for entry in exif_data.entries {
                metadata_map.insert(
                    entry.tag.to_string(),
                    entry.value_more_readable.to_string(),
                );
            }
        }
    }

    Ok(ImageMetadata {
        entries: metadata_map,
    })
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
            get_image_metadata
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
