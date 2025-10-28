import settingsStore from './stores/settingsStore.js';

export function safe(callable) {
  try {
    return callable();
  } catch (error) {
    return null;
  }
}

export function safeUse(callable, callback) {
  try {
    const out = callable();

    if (out) callback(out);

    return null;
  } catch (error) {
    return null;
  }
}

export function albumPathRelatedToDefaultPath(albumPath) {
  return albumPath.replace(settingsStore.getState().albumDirectory, '');
}
/**
 * @fileoverview Utility functions and data structure for categorizing common EXIF tags.
 * The tags are based on standard EXIF specifications and common output from tools like ExifTool.
 *
 * The list is intentionally curated to focus on the most commonly encountered and human-relevant tags.
 */

// -----------------------------------------------------------------------------
// 1. Categorized EXIF Tag Map
// -----------------------------------------------------------------------------

/**
 * A frozen object containing the categorized list of relevant EXIF tags.
 * Keys are the category names, and values are arrays of corresponding tag names.
 * Tags are typically capitalized (Title Case) as output by many EXIF parsers (like rexif).
 */
export const EXIF_TAG_CATEGORIES = Object.freeze({
    'Camera/Device': [
        'Make',
        'Model',
        'LensMake',
        'LensModel',
        'BodySerialNumber',
        'SerialNumber',
        'Software',
        'Artist',
        'HostComputer',
        'LensSpecification',
        'OwnerName',
        'Manufacturer',
        'Lens specification',
        'Lens model'
    ],
    'Exposure/Settings': [
        'FNumber',
        'ExposureTime',
        'ISOSpeedRatings',
        'FocalLength',
        'FocalLengthIn35mmFormat',
        'ApertureValue',
        'ShutterSpeedValue',
        'ExposureProgram',
        'MeteringMode',
        'Flash',
        'ExposureMode',
        'WhiteBalance',
        'DigitalZoomRatio',
        'ColorSpace',
        'ExposureBiasValue',
        'SensitivityType',
        'MaxApertureValue',
        'ExposureCompensation',
        'BrightnessValue',
        'SubjectArea',
        'SensingMethod',
        'Aperture',
        'Aperture value',
        'Exposure time',
        'Color space',
        'Shutter speed',
        'White balance mode',
        'Meteting mode',
        'Focal length',
        'Sensitivity type',
        'Exposure program',
        'Exposure mode',
        'Exposure bias value',
        'ISO speed ratings'
    ],
    'Date/Time': [
        'DateTimeOriginal',
        'CreateDate',
        'ModifyDate',
        'SubSecTimeOriginal',
        'SubSecTimeDigitized',
        'OffsetTimeOriginal',
        'DateTimeDigitized',
        'Image date',
        'Date of original image',
        'Date of image digitalization'
    ],
    'Image Properties': [
        'ImageWidth',
        'ImageHeight',
        'Orientation',
        'ResolutionUnit',
        'XResolution',
        'YResolution',
        'YCbCrPositioning',
        'ThumbnailImage',
        'FocalPlaneXResolution',
        'FocalPlaneYResolution',
        'FocalPlaneResolutionUnit',
        'BitsPerSample',
        'SamplesPerPixel',
        'PhotometricInterpretation',
        'Focal plane X resolution',
        'Focal plane Y resolution',
        'Focal plane resolution unit',
        'Resolution Unit',
        'Y Resolution',
        'X Resolution'
    ],
    'Location (GPS)': [
        'GPSLatitude',
        'GPSLongitude',
        'GPSAltitude',
        'GPSDateStamp',
        'GPSTimeStamp',
        'GPSStatus',
        'GPSMeasureMode',
        'GPSDOP',
        'GPSImgDirection',
        'GPSMapDatum',
        'GPSVersionID',
        'GPSLatitudeRef',
        'GPSLongitudeRef',
        'GPSAltitudeRef',
        'GPSSpeed',
        'GPSSpeedRef',
        'GPSTrack',
        'GPS version ID'
    ],
    'Licensing & Comments': [
        'Copyright',
        'UserComment',
        'ImageDescription',
        'XPComment',
        'XPAuthor',
        'User comment'
    ],
    'MakerNotes (Common)': [
        'PictureStyle',
        'CanonFirmwareVersion',
        'CanonModelID',
        'FocusMode',
        'SensorInfo',
        'ActiveDLighting',
        'PictureControl',
        'LensType',
        'VibrationReduction',
        'NoiseReduction',
        'DynamicRangeOptimizer',
        'CreativeStyle'
    ],
    'IPTC (Publishing & Keywords)': [
        'ObjectName',
        'Headline',
        'Caption-Abstract',
        'Keywords',
        'By-line',
        'By-lineTitle',
        'Credit',
        'Source',
        'Instructions',
        'City',
        'Province-State',
        'Country-PrimaryLocationName'
    ],
    'XMP (Adobe & Ratings)': [
        'Rating',
        'Label',
        'dc:creator',
        'dc:title',
        'dc:description',
        'dc:subject',
        'dc:rights',
        'photoshop:Headline',
        'photoshop:DateCreated',
        'xmpMM:History',
        'crs:Version',
        'crs:WhiteBalance',
        'crs:Temperature',
        'crs:Tint',
        'crs:Exposure2012',
        'crs:Contrast2012',
        'crs:Highlights2012',
        'crs:Shadows2012',
        'crs:Clarity2012',
        'crs:Vibrance',
        'crs:Saturation'
    ],
    'Other/Miscellaneous': [
        'ExifVersion',
        'FlashpixVersion',
        'ComponentsConfiguration',
        'CustomRendered',
        'SceneCaptureType',
        'Compression',
        'MakerNote',
        'ExifIFDPointer',
        'GPSInfoIFDPointer',
        'Maker note',
        'Flashpix version',
        'This image has an Exif SubIFD',
        'This image has a GPS SubIFD',
        'Unknown to this library, or manufacturer-specific',
        'Exif version',
        'Scene capture type',
        'Custom rendered'
    ]
});

// -----------------------------------------------------------------------------
// 2. Utility Functions
// -----------------------------------------------------------------------------

/**
 * A pre-processed Map for quick O(1) lookups of a tag's category.
 * Tag names are normalized to lowercase for case-insensitive matching.
 */
const TAG_CATEGORY_MAP = (() => {
    const map = new Map();
    for (const [category, tags] of Object.entries(EXIF_TAG_CATEGORIES)) {
        for (const tag of tags) {
            map.set(tag.toLowerCase(), category);
        }
    }
    return map;
})();

/**
 * Finds the category for a given EXIF tag name.
 *
 * @param {string} tagName The name of the EXIF tag (e.g., "FNumber").
 * @returns {string} The category name (e.g., "Exposure/Settings"), or "Uncategorized" if not found.
 */
export function getExifCategory(tagName) {
    if (typeof tagName !== 'string') {
        return 'Uncategorized';
    }
    // Normalize input to lowercase for lookup
    const normalizedTag = tagName.toLowerCase();

    return TAG_CATEGORY_MAP.get(normalizedTag) || 'Uncategorized';
}

/**
 * Takes a flat map of EXIF tags and values and structures it into
 * a categorized object based on EXIF_TAG_CATEGORIES.
 *
 * @param {Object<string, string>} flatDataMap A map where keys are tag names (e.g., "Make")
 * and values are the tag contents (e.g., "Canon").
 * @returns {Object<string, Array<{name: string, value: string}>>} A structured object
 * where keys are categories and values are arrays of {name, value} objects.
 */
export function categorizeExifData(flatDataMap) {
    if (!flatDataMap || typeof flatDataMap !== 'object') {
        return {};
    }

    const categorizedData = {};

    for (const category of Object.keys(EXIF_TAG_CATEGORIES)) {
        categorizedData[category] = [];
    }
    categorizedData['Uncategorized'] = [];

    for (const tagName in flatDataMap) {
        if (Object.prototype.hasOwnProperty.call(flatDataMap, tagName)) {
            const tagValue = flatDataMap[tagName];
            const category = getExifCategory(tagName);

            categorizedData[category].push({
                name: tagName,
                value: tagValue
            });
        }
    }

    const finalData = {};
    for (const category in categorizedData) {
        if (categorizedData[category].length > 0) {
            finalData[category] = categorizedData[category];
        }
    }

    return finalData;
}

export function isRawFile(path) {
    return path.toLowerCase().endsWith('.raw') ||
        path.toLowerCase().endsWith('.arw') ||
        path.toLowerCase().endsWith('.cr2') ||
        path.toLowerCase().endsWith('.cr3') ||
        path.toLowerCase().endsWith('.dng') ||
        path.toLowerCase().endsWith('.nef') ||
        path.toLowerCase().endsWith('.orf') ||
        path.toLowerCase().endsWith('.raf') ||
        path.toLowerCase().endsWith('.sr2') ||
        path.toLowerCase().endsWith('.srf') ||
        path.toLowerCase().endsWith('.kdc') ||
        path.toLowerCase().endsWith('.mrw') ||
        path.toLowerCase().endsWith('.pef') ||
        path.toLowerCase().endsWith('.x3f');
}


/**
 * Converts a Tauri asset path (asset://localhost/...) back to a
 * regular file system path string.
 *
 * @param {string} tauriPath - The input string starting with "asset://localhost/".
 * @returns {string | null} The decoded file system path, or null if the
 * input is invalid or doesn't have the correct prefix.
 */
export function tauriAssetToPath(tauriPath) {
    const prefix = "asset://localhost/";

    if (typeof tauriPath !== 'string' || !tauriPath.startsWith(prefix)) {
        console.error("Invalid input: Path does not start with", prefix);
        return null; // Return null for invalid input
    }

    // Remove the prefix
    const encodedPath = tauriPath.substring(prefix.length);

    try {
        // Decode the URL-encoded path
        return decodeURIComponent(encodedPath);
    } catch (error) {
        console.error("Failed to decode URI component:", error);
        return null; // Return null if decoding fails
    }
}