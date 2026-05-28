/**
 * Reversible base64-rot character shifting obfuscator
 * Stored localStorage key values will look like secure cryptographic hashes
 */

export function obfuscateKey(key) {
  if (!key) return '';
  try {
    const rawStr = key.trim();
    // Convert to Base64
    const b64 = btoa(rawStr);
    // Shift character codes to create secure gibberish cipher
    return b64.split('').map(char => String.fromCharCode(char.charCodeAt(0) + 3)).join('');
  } catch (err) {
    return '';
  }
}

export function deobfuscateKey(obfuscated) {
  if (!obfuscated) return '';
  try {
    // Reverse shift
    const unshifted = obfuscated.split('').map(char => String.fromCharCode(char.charCodeAt(0) - 3)).join('');
    // Decode from Base64
    return atob(unshifted);
  } catch (err) {
    // If decoding fails, return raw string (safe fallback for legacy plain keys)
    return obfuscated;
  }
}
