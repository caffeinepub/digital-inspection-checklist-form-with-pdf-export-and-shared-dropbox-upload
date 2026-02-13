import { useActor } from '../../hooks/useActor';

export async function uploadChecklistPdf(
  roomNumber: string,
  pdfBytes: Uint8Array
): Promise<void> {
  // Get the Dropbox token from backend
  const token = await getDropboxTokenFromBackend();
  
  if (!token) {
    throw new Error('Dropbox token not configured');
  }

  // Upload to Dropbox API
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
    body: pdfBytes.buffer as ArrayBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dropbox upload failed: ${errorText}`);
  }
}

// Helper to fetch token from backend
async function getDropboxTokenFromBackend(): Promise<string | null> {
  // This needs to be called from a component context with useActor
  // For now, we'll throw an error to indicate this needs to be refactored
  throw new Error('getDropboxTokenFromBackend must be called from component context');
}
