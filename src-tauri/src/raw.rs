use rsraw::{RawImage, ThumbnailImage};
use std::fs;
use std::path::{Path, PathBuf};

use std::error::Error;

/// Define a Result type alias for easier error handling
type ProcessResult<T> = Result<T, Box<dyn Error>>;

/// Processes a RAW file using the rsraw v0.1.0 library,
/// finds the largest embedded thumbnail, and saves it as a JPEG
/// in the .cache directory.
///
/// largest is saved in `rawpreview` directory and smaller in thumbnails as rest
///
/// Returns the path to the created JPEG file.
pub fn process_raw_file(raw_file_path: String, jpeg_path: &mut PathBuf) -> ProcessResult<PathBuf> {
    let file_content: Vec<u8> = fs::read(&raw_file_path)?;
    let mut raw_file = RawImage::open(&file_content)?;
    println!("DEBUG: RawImage opened. Extracting thumbnails...");
    let thumbs = raw_file.extract_thumbs()?;

    let largest_thumb = thumbs.iter().max_by_key(|thumb| thumb.width * thumb.height);
    let smaller_thumb = thumbs.iter().min_by_key(|thumb| thumb.width * thumb.height);

    // The path for the smaller thumbnail, inside the 'thumbnails' directory.
    let thumbnail_path_str = jpeg_path
        .to_str()
        .ok_or("Invalid jpeg_path: not valid UTF-8")?
        .replace("rawpreview", "thumbnails");
    let thumbnail_path = PathBuf::from(thumbnail_path_str);

    // Save the smaller thumbnail to the 'thumbnails' directory.
    save_thumb_with_metadata(smaller_thumb, &thumbnail_path, &PathBuf::from(&raw_file_path))?;

    // Save the largest thumbnail (the preview) to the 'rawpreview' directory and return its path.
    Ok(save_thumb_with_metadata(largest_thumb, jpeg_path, &PathBuf::from(&raw_file_path))?)
}

pub fn get_preview_path_by_thumbnail(thumbnail_path: &str) -> String {
    thumbnail_path.replace("thumbnails", "rawpreview").to_string()
}

fn save_thumb_with_metadata(thumb: Option<&ThumbnailImage>, path: &PathBuf, metadata_original_path: &PathBuf) -> ProcessResult<PathBuf> {
    if let Some(thumb) = thumb {
        println!(
            "DEBUG: Found thumbnail ({}x{}). Saving to: {}",
            thumb.width, thumb.height, path.display()
        );

        fs::write(&path, &thumb.data)?;

        let original_path_str = metadata_original_path.to_str().ok_or("Original path is not valid UTF-8")?;
        let dest_path_str = path.to_str().ok_or("Destination path is not valid UTF-8")?;

        copy_metadata(original_path_str, dest_path_str)?;

        println!("DEBUG: Thumbnail saved successfully to {}", path.display());

        ProcessResult::Ok(path.to_path_buf())
    } else {
        println!("DEBUG: No thumbnail found to save for path {}", path.display());

        Err("No thumbnails found in the file.".into())
    }
}

type CopyMetaResult<T> = Result<T, Box<dyn Error>>;

/// Copies metadata (EXIF, IPTC, XMP) from an original file (e.g., RAW)
/// to a copy file (e.g., JPEG preview) using the rexiv2 library.
///
/// # Arguments
/// * `original_path` - Path to the source file with metadata.
/// * `copy_path` - Path to the destination file to write metadata to.
pub fn copy_metadata(original_path: &str, copy_path: &str) -> CopyMetaResult<()> {
    println!(
        "DEBUG: [rexiv2] Attempting to copy metadata from {} to {}",
        original_path, copy_path
    );

    let copy_p = Path::new(copy_path);

    if !copy_p.exists() {
        return Err(format!("Destination file {} does not exist.", copy_path).into());
    }

    let metadata = rexiv2::Metadata::new_from_path(original_path)?;
    println!("DEBUG: [rexiv2] Successfully read metadata from {}", original_path);

    metadata.save_to_file(copy_p)?;
    println!("DEBUG: [rexiv2] Successfully wrote metadata to {}", copy_path);

    Ok(())
}