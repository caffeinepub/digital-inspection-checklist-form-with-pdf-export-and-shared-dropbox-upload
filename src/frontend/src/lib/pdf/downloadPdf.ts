export function downloadPdf(pdfBytes: Uint8Array, filename: string): void {
  // Create a new Uint8Array to ensure proper typing for Blob
  const bytes = new Uint8Array(pdfBytes);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
