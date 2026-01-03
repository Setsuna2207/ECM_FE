/**
 * Convert Google Drive sharing URLs to direct image URLs
 * @param {string} url - The URL to convert
 * @returns {string} - Direct image URL or original URL
 */
export const convertGoogleDriveUrl = (url) => {
    if (!url) return url;

    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
        // Extract file ID from various Google Drive URL formats
        let fileId = null;

        // Format: https://drive.google.com/file/d/FILE_ID/view
        const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match1) {
            fileId = match1[1];
        }

        // Format: https://drive.google.com/open?id=FILE_ID
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match2) {
            fileId = match2[1];
        }

        // If we found a file ID, convert to direct image URL
        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
    }

    // Return original URL if not Google Drive or already in correct format
    return url;
};

/**
 * Get full image URL, handling Google Drive, absolute URLs, and relative paths
 * @param {string} url - The URL to process
 * @param {string} baseUrl - Optional base URL for relative paths
 * @returns {string} - Full image URL
 */
export const getFullImageUrl = (url, baseUrl) => {
    if (!url) return url;

    // First, try to convert Google Drive URLs
    const convertedUrl = convertGoogleDriveUrl(url);

    // If it's already a full URL (http/https), return as is
    if (convertedUrl.startsWith('http://') || convertedUrl.startsWith('https://')) {
        return convertedUrl;
    }

    // For relative URLs, prepend the base URL
    if (convertedUrl.startsWith('/')) {
        const base = baseUrl || import.meta.env.VITE_API_BASE_URL?.replace(/\/api.*$/, '') || 'https://localhost:7264';
        return `${base}${convertedUrl}`;
    }

    // Return as is for other cases
    return convertedUrl;
};
