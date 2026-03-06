/**
 * DevPanda — Helper utilities
 */

/** Create DOM element with properties */
export function el(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
        if (key === 'className') element.className = val;
        else if (key === 'innerHTML') element.innerHTML = val;
        else if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), val);
        else element.setAttribute(key, val);
    }
    children.forEach(child => {
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else if (child) element.appendChild(child);
    });
    return element;
}

/** Download a text file */
export function downloadFile(filename, content, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/** Download a zip (using built-in Blob) */
export function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/** Format number with commas */
export function formatNumber(n) {
    return n.toLocaleString('en-US');
}

/** Format bytes to human readable */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
