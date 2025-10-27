use rsraw::RawImage; // The main struct from the rsraw crate
use image::{ImageFormat, ColorType}; // For saving and color type
use std::fs;
use std::path::{Path, PathBuf};

// Define a Result type alias for easier error handling
type ProcessResult<T> = Result<T, Box<dyn std::error::Error>>;

/// Processes a RAW file using the rsraw v0.1.0 library,
/// finds the largest embedded thumbnail, and saves it as a JPEG
/// in the .cache directory.
///
/// Returns the path to the created JPEG file.
pub fn process_raw_file(raw_file_path: String, jpeg_path: &mut PathBuf) -> ProcessResult<PathBuf> {
    let file_content: Vec<u8> = fs::read(&raw_file_path)?;
    let mut raw_file = RawImage::open(&file_content)?;
    println!("DEBUG: RawImage opened. Extracting thumbnails...");
    let thumbs = raw_file.extract_thumbs()?;

    let largest_thumb = thumbs.into_iter().max_by_key(|thumb| thumb.width * thumb.height);

    if let Some(thumb) = largest_thumb {
        println!(
            "DEBUG: Found largest thumbnail ({}x{}). Saving to: {}",
            thumb.width, thumb.height, jpeg_path.display()
        );

        fs::write(&jpeg_path, &thumb.data)?;

        println!("DEBUG: Largest thumbnail saved successfully.");
        Ok(jpeg_path.to_path_buf())
    } else {
        println!("DEBUG: No thumbnails found in the file.");
        Err("No thumbnail found in RAW file".into())
    }
}