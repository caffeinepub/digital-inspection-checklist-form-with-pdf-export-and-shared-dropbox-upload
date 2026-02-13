export interface PdfDownloadResult {
  success: boolean;
  objectUrl?: string;
  filename: string;
}

/**
 * Mobile-safe PDF download helper.
 * Creates a Blob URL and attempts download via anchor element.
 * Returns the ObjectURL for fallback actions (e.g., open in new tab on iOS).
 * Caller is responsible for revoking the URL after use.
 */
export function downloadPdf(pdfBytes: Uint8Array, filename: string): PdfDownloadResult {
  // Ensure filename ends with .pdf
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  
  // Create a new Uint8Array to ensure proper typing for Blob
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  try {
    // Attempt download via anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Return URL for fallback actions (do NOT revoke immediately)
    return {
      success: true,
      objectUrl: url,
      filename: safeFilename,
    };
  } catch (error) {
    console.error('Download error:', error);
    // Still return the URL for fallback
    return {
      success: false,
      objectUrl: url,
      filename: safeFilename,
    };
  }
}

/**
 * Safely revoke an ObjectURL after a delay to ensure browser has finished using it.
 * Use this after download/open actions complete.
 */
export function revokeObjectUrlSafely(url: string, delayMs: number = 1000): void {
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error revoking ObjectURL:', error);
    }
  }, delayMs);
}
