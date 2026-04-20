import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

// ShareCardService - DOM to PNG capture with native share + download fallback
// Exports 1200×630 PNG (Open Graph standard)
@Injectable({
  providedIn: 'root'
})
export class ShareCardService {
  private readonly CARD_WIDTH = 1200;
  private readonly CARD_HEIGHT = 630;

  /**
   * Capture element to PNG and share via native API or download as fallback
   * @param elementId - DOM element ID to capture
   * @param slug - Optional filename slug (defaults to 'rawls-results-card')
   */
  async shareOrDownloadCard(elementId: string, slug?: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Capture DOM element to canvas at exact 1200×630 dimensions
    const canvas = await html2canvas(element, {
      width: this.CARD_WIDTH,
      height: this.CARD_HEIGHT,
      scale: 2, // Higher resolution for crisp text
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    // Scale canvas back to exact 1200×630 for output
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = this.CARD_WIDTH;
    outputCanvas.height = this.CARD_HEIGHT;
    const ctx = outputCanvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(canvas, 0, 0, this.CARD_WIDTH, this.CARD_HEIGHT);
    }

    // Generate filename using slug or fallback
    const filename = slug
      ? `${slug}-results-card.png`
      : 'rawls-results-card.png';

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      outputCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    });

    // Try native share if available
    if (this.canNativeShare(blob)) {
      await this.nativeShare(blob, filename);
    } else {
      // Fallback to download
      this.downloadBlob(blob, filename);
    }
  }

  /**
   * Legacy method: download-only (preserved for backward compatibility)
   */
  async captureElementToPng(elementId: string, slug?: string): Promise<void> {
    return this.shareOrDownloadCard(elementId, slug);
  }

  /**
   * Check if native share is available and supports file sharing
   */
  private canNativeShare(blob: Blob): boolean {
    if (!navigator.share) {
      return false;
    }

    // Check if sharing files is supported
    if (navigator.canShare) {
      const file = new File([blob], 'test.png', { type: 'image/png' });
      return navigator.canShare({ files: [file] });
    }

    // Fallback: assume file sharing is supported if navigator.share exists
    return true;
  }

  /**
   * Share via native Web Share API
   */
  private async nativeShare(blob: Blob, filename: string): Promise<void> {
    const file = new File([blob], filename, { type: 'image/png' });
    
    try {
      await navigator.share({
        title: 'My Rawls Results',
        text: 'Check out my philosophical profile!',
        files: [file]
      });
    } catch (error) {
      // User cancelled or share failed - fallback to download
      if (error instanceof Error && error.name !== 'AbortError') {
        this.downloadBlob(blob, filename);
      }
    }
  }

  /**
   * Download blob as file
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}