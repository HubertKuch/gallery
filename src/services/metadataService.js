class MetadataService {
  async getMetadata(photoPath) {
    // Placeholder for metadata extraction logic.
    // In a real application, you would use a library like `exif-js`
    // or a backend service to extract the metadata.
    console.log(`Extracting metadata for: ${photoPath}`);
    return {
      'File Name': photoPath.split('/').pop(),
      'Date Taken': '2025-10-26',
      'Camera Model': 'TauriCam',
      'Resolution': '4000x3000',
      'ISO': '100',
      'Aperture': 'f/1.8',
      'Shutter Speed': '1/1000s',
    };
  }
}

const metadataService = new MetadataService();
export default metadataService;
