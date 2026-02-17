/**
 * Uploads a PDF to Dropbox using the provided access token.
 * This is a pure utility function that does not use React hooks.
 */
export async function uploadChecklistPdf(
  roomNumber: string,
  pdfBytes: Uint8Array,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create a new Uint8Array to ensure proper typing for fetch body
    const bytes = new Uint8Array(pdfBytes);
    
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${roomNumber}.pdf`,
          mode: 'overwrite',
          autorename: false,
          mute: false,
        }),
      },
      body: bytes,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dropbox API error:', errorText);
      return {
        success: false,
        error: `Dropbox upload failed (${response.status}): ${errorText}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Dropbox upload exception:', error);
    return {
      success: false,
      error: error?.message || 'Network error during upload',
    };
  }
}
