export function sanitizeFilename(roomNumber: string): string {
  const sanitized = roomNumber
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  return `${sanitized || 'checklist'}.pdf`;
}
