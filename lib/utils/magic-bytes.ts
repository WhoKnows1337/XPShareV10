/**
 * Magic Bytes Verification for File Type Security
 * Prevents file type spoofing (e.g., .exe renamed to .jpg)
 */

export interface MagicByteSignature {
  bytes: number[];
  mimeType: string;
  description: string;
  offset?: number; // Some signatures start at offset
}

/**
 * Magic Byte signatures for common file types
 * Source: https://en.wikipedia.org/wiki/List_of_file_signatures
 */
export const MAGIC_BYTE_SIGNATURES: MagicByteSignature[] = [
  // Images
  { bytes: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg', description: 'JPEG' },
  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mimeType: 'image/png', description: 'PNG' },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], mimeType: 'image/gif', description: 'GIF87a' },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], mimeType: 'image/gif', description: 'GIF89a' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp', description: 'WEBP', offset: 0 },

  // Videos
  { bytes: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4', description: 'MP4', offset: 4 },
  { bytes: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4', description: 'MP4', offset: 4 },
  { bytes: [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], mimeType: 'video/mp4', description: 'MP4', offset: 4 },
  { bytes: [0x1A, 0x45, 0xDF, 0xA3], mimeType: 'video/webm', description: 'WebM/MKV' },
  { bytes: [0x66, 0x74, 0x79, 0x70, 0x71, 0x74], mimeType: 'video/quicktime', description: 'MOV', offset: 4 },

  // Audio
  { bytes: [0x49, 0x44, 0x33], mimeType: 'audio/mpeg', description: 'MP3 with ID3' },
  { bytes: [0xFF, 0xFB], mimeType: 'audio/mpeg', description: 'MP3' },
  { bytes: [0xFF, 0xF3], mimeType: 'audio/mpeg', description: 'MP3' },
  { bytes: [0xFF, 0xF2], mimeType: 'audio/mpeg', description: 'MP3' },
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeType: 'audio/wav', description: 'WAV' },
  { bytes: [0x4F, 0x67, 0x67, 0x53], mimeType: 'audio/ogg', description: 'OGG' },
  { bytes: [0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], mimeType: 'audio/x-m4a', description: 'M4A', offset: 4 },

  // Documents
  { bytes: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf', description: 'PDF' },

  // Archives/Office (ZIP-based)
  { bytes: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/zip', description: 'ZIP/XLSX/DOCX' },
  { bytes: [0x50, 0x4B, 0x05, 0x06], mimeType: 'application/zip', description: 'ZIP (empty)' },
  { bytes: [0x50, 0x4B, 0x07, 0x08], mimeType: 'application/zip', description: 'ZIP (spanned)' },

  // Old Office formats
  { bytes: [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1], mimeType: 'application/vnd.ms-excel', description: 'XLS' },
];

/**
 * DANGEROUS file signatures to explicitly block
 */
export const DANGEROUS_SIGNATURES: MagicByteSignature[] = [
  { bytes: [0x4D, 0x5A], mimeType: 'application/x-msdownload', description: 'Windows EXE/DLL' },
  { bytes: [0x7F, 0x45, 0x4C, 0x46], mimeType: 'application/x-executable', description: 'Linux ELF' },
  { bytes: [0xCA, 0xFE, 0xBA, 0xBE], mimeType: 'application/x-mach-binary', description: 'macOS Binary' },
  { bytes: [0x23, 0x21], mimeType: 'text/x-shellscript', description: 'Shell Script' },
];

/**
 * Read the first N bytes from a File object
 */
/**
 * Read the first N bytes from a File object
 * Works in both browser (FileReader) and server (Buffer/ArrayBuffer)
 */
async function readFileBytes(file: File, numBytes: number): Promise<Uint8Array> {
  try {
    // Server-side (Node.js): Use arrayBuffer() method
    // This works in Next.js API routes where File is a Blob
    const blob = file.slice(0, numBytes);
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    // Fallback: Try browser FileReader (should never hit this in API routes)
    if (typeof FileReader !== 'undefined') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const blob = file.slice(0, numBytes);

        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(new Uint8Array(reader.result));
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
      });
    }
    
    throw new Error('Unable to read file bytes: No compatible API available');
  }
}

/**
 * Check if bytes match a signature at a given offset
 */
function matchesSignature(fileBytes: Uint8Array, signature: MagicByteSignature): boolean {
  const offset = signature.offset || 0;

  for (let i = 0; i < signature.bytes.length; i++) {
    if (fileBytes[offset + i] !== signature.bytes[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Detect file type from magic bytes
 * Returns the detected MIME type or null if unknown
 */
export async function detectFileType(file: File): Promise<string | null> {
  try {
    // Read first 32 bytes (enough for most signatures)
    const fileBytes = await readFileBytes(file, 32);

    // Check against all known signatures
    for (const signature of MAGIC_BYTE_SIGNATURES) {
      if (matchesSignature(fileBytes, signature)) {
        console.log(`[Magic Bytes] Detected: ${signature.description} (${signature.mimeType})`);
        return signature.mimeType;
      }
    }

    console.warn('[Magic Bytes] Unknown file signature:', Array.from(fileBytes.slice(0, 8)));
    return null;
  } catch (error) {
    console.error('[Magic Bytes] Error reading file:', error);
    return null;
  }
}

/**
 * Check if file contains dangerous executable code
 */
export async function isDangerousFile(file: File): Promise<boolean> {
  try {
    const fileBytes = await readFileBytes(file, 16);

    for (const signature of DANGEROUS_SIGNATURES) {
      if (matchesSignature(fileBytes, signature)) {
        console.error(`[Magic Bytes] DANGEROUS FILE DETECTED: ${signature.description}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[Magic Bytes] Error checking dangerous file:', error);
    // Err on the side of caution
    return true;
  }
}

/**
 * Verify that claimed MIME type matches actual file content
 * Prevents spoofing attacks (e.g., .exe renamed to .jpg)
 */
export async function verifyMimeType(file: File, claimedMimeType: string): Promise<{
  valid: boolean;
  detectedType: string | null;
  reason?: string;
}> {
  // First check for dangerous files
  const isDangerous = await isDangerousFile(file);
  if (isDangerous) {
    return {
      valid: false,
      detectedType: null,
      reason: 'File contains executable code',
    };
  }

  // Detect actual file type
  const detectedType = await detectFileType(file);

  if (!detectedType) {
    return {
      valid: false,
      detectedType: null,
      reason: 'Unknown or unsupported file type',
    };
  }

  // For ZIP-based formats (XLSX, DOCX), check if claimed type is also ZIP-based
  const zipBasedTypes = [
    'application/zip',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/vnd.ms-excel', // XLS (old format uses different signature)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  ];

  const isDetectedZip = detectedType === 'application/zip';
  const isClaimedZipBased = zipBasedTypes.includes(claimedMimeType);

  if (isDetectedZip && isClaimedZipBased) {
    // Both are ZIP-based, allow it (can't distinguish XLSX from ZIP by magic bytes alone)
    return {
      valid: true,
      detectedType,
    };
  }

  // ✅ Allow common image format conversions (Industry Best Practice)
  // WhatsApp/Apps often rename or convert images (PNG → JPEG, etc.)
  // All these formats are safe and interchangeable for security purposes
  const imageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isImageConversion =
    imageFormats.includes(detectedType) &&
    imageFormats.includes(claimedMimeType);

  if (isImageConversion) {
    console.log(`[Magic Bytes] ✅ Allowing image format conversion: ${claimedMimeType} → ${detectedType}`);
    return {
      valid: true,
      detectedType,
    };
  }

  // Exact match required for non-image formats (PDF, Video, Audio, etc.)
  if (detectedType === claimedMimeType) {
    return {
      valid: true,
      detectedType,
    };
  }

  // MIME type mismatch for non-image formats
  return {
    valid: false,
    detectedType,
    reason: `File type mismatch: claimed ${claimedMimeType}, detected ${detectedType}`,
  };
}
