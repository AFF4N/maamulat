import type { MaamulatState } from '../types';

export interface ExportResult {
  success: boolean;
  method: 'share' | 'download' | 'copy';
  cancelled?: boolean;
  error?: string;
}

/**
 * Robust JSON backup exporter optimized for iOS Safari, iOS PWA (standalone mode),
 * Android Chrome, and desktop browsers.
 *
 * In iOS Safari and standalone PWA mode, synthetic <a download> clicks with data: URLs
 * cause WebKit navigation glitches and fail to save files. This function uses the
 * native Web Share API with a File object when available (which opens the native iOS
 * "Save to Files", AirDrop, or WhatsApp sheet), falling back cleanly to Blob ObjectURL
 * download, and finally clipboard copy.
 */
export async function exportBackupJSON(state: MaamulatState): Promise<ExportResult> {
  if (!state) {
    return { success: false, method: 'download', error: 'No state to export' };
  }

  const fileName = `maamulat-backup-${state.todayDate || 'today'}.json`;
  const jsonContent = JSON.stringify(state, null, 2);

  // 1. Try Native Web Share API with File (Primary for iOS Safari & iOS PWA)
  if (
    typeof navigator !== 'undefined' &&
    typeof File !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof navigator.share === 'function'
  ) {
    try {
      const file = new File([jsonContent], fileName, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Maamulat Backup',
          text: `Maamulat spiritual tracker data backup (${state.todayDate})`,
        });
        return { success: true, method: 'share' };
      }
    } catch (err: any) {
      // User tapped "Cancel" or swiped away the share sheet
      if (err?.name === 'AbortError') {
        return { success: true, method: 'share', cancelled: true };
      }
      console.warn('Web Share API failed, falling back to blob download', err);
    }
  }

  // 2. Blob Download via createObjectURL (Desktop & Android browsers)
  try {
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.style.display = 'none';
    downloadAnchor.href = url;
    downloadAnchor.download = fileName;
    downloadAnchor.setAttribute('download', fileName);
    downloadAnchor.rel = 'noopener';

    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    setTimeout(() => {
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    }, 1500);

    return { success: true, method: 'download' };
  } catch (err) {
    console.warn('Blob download failed, attempting clipboard copy', err);
  }

  // 3. Fallback: Copy to Clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(jsonContent);
      return { success: true, method: 'copy' };
    }
  } catch (clipErr) {
    console.error('All export methods failed', clipErr);
  }

  return { success: false, method: 'download', error: 'Unable to export backup.' };
}

/**
 * Validates whether the given text is a valid Maamulat backup structure.
 */
export function validateBackupJSON(rawText: string): { valid: boolean; state?: MaamulatState; error?: string } {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'The chosen file is not a valid JSON document.' };
    }
    if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      return { valid: false, error: 'The file does not appear to be a Maamulat backup (missing tasks list).' };
    }
    return { valid: true, state: parsed as MaamulatState };
  } catch (err: any) {
    return { valid: false, error: 'Failed to read JSON: ' + (err?.message || 'Syntax error') };
  }
}

/**
 * Cross-platform file text reader supporting both modern File.text() and FileReader.
 */
export async function readUploadedFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

