/**
 * Escapes HTML special characters to prevent XSS when
 * interpolating dynamic content into innerHTML.
 */
export function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Escapes a string for safe use inside HTML attribute values.
 * Handles quotes and other special characters.
 */
export function escapeAttr(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Simple Base64 encoding to prevent plaintext shoulder-surfing or scanning
 * of baby profile details in localStorage.
 */
export function obfuscate(text) {
  if (!text) return '';
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    return text;
  }
}

/**
 * Decodes the base64-obfuscated profile string back into standard text.
 */
export function deobfuscate(cipher) {
  if (!cipher) return '';
  try {
    return decodeURIComponent(escape(atob(cipher)));
  } catch (e) {
    return cipher; // fallback if it was already plaintext
  }
}

