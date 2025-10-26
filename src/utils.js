import albumService from './services/albumService.js';
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
        'SerialNumber', // Common alternative
        'Software',
        'Artist',
        'HostComputer'
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
    ],
    'Date/Time': [
        'DateTimeOriginal',
        'CreateDate',
        'ModifyDate',
        'SubSecTimeOriginal',
        'SubSecTimeDigitized',
        'OffsetTimeOriginal',
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
    ],
    'Location (GPS)': [
        'GPSLatitude',
        'GPSLongitude',
        'GPSAltitude',
        'GPSDateStamp',
        'GPSTimeStamp',
        'GPSStatus',
        'GPSMeasureMode',
        'GPSDOP', // Dilution of Precision
        'GPSImgDirection',
        'GPSMapDatum'
    ],
    'Licensing & Comments': [
        'Copyright',
        'UserComment',
        'ImageDescription',
        'XPComment', // Windows equivalents
        'XPAuthor',
    ],
    'Other/Miscellaneous': [
        'ExifVersion',
        'FlashpixVersion',
        'ComponentsConfiguration',
        'CustomRendered',
        'SceneCaptureType',
        'Compression',
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
