import { domToPng } from 'modern-screenshot';

/**
 * Captures a screenshot of the current page using modern-screenshot
 * Supports modern CSS features like oklch() colors
 * @returns Promise<string> Base64 data URL of the screenshot
 */
export async function captureScreenshot(): Promise<string> {
  // Hide the feedback widget before capturing
  const feedbackButton = document.querySelector('[aria-label="Open feedback"]') ||
                         document.querySelector('[aria-label="Report bug or send feedback"]');
  const feedbackDialog = document.querySelector('[role="dialog"]');

  if (feedbackButton) {
    (feedbackButton as HTMLElement).style.display = 'none';
  }
  if (feedbackDialog) {
    (feedbackDialog as HTMLElement).style.display = 'none';
  }

  try {
    // modern-screenshot supports oklch() and other modern CSS out-of-the-box!
    const dataUrl = await domToPng(document.body, {
      quality: 0.95,
    });

    return dataUrl;
  } finally {
    // Show the feedback elements again
    if (feedbackButton) {
      (feedbackButton as HTMLElement).style.display = '';
    }
    if (feedbackDialog) {
      (feedbackDialog as HTMLElement).style.display = '';
    }
  }
}

/**
 * Allows user to select an area and captures only that region
 * @returns Promise<string> Base64 data URL of the selected area screenshot
 */
export async function captureAreaScreenshot(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create overlay for area selection
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      cursor: crosshair;
      z-index: 999999;
    `;

    const selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
      position: absolute;
      border: 2px dashed #00ff00;
      background: rgba(0, 255, 0, 0.1);
      display: none;
    `;
    overlay.appendChild(selectionBox);

    const instructionText = document.createElement('div');
    instructionText.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 1000000;
    `;
    instructionText.textContent = 'Click and drag to select an area. Press ESC to cancel.';
    overlay.appendChild(instructionText);

    document.body.appendChild(overlay);

    let startX = 0;
    let startY = 0;
    let isSelecting = false;

    const handleMouseDown = (e: MouseEvent) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.display = 'block';
      selectionBox.style.left = startX + 'px';
      selectionBox.style.top = startY + 'px';
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    };

    const cleanup = () => {
      overlay.removeEventListener('mousedown', handleMouseDown);
      overlay.removeEventListener('mousemove', handleMouseMove);
      overlay.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.removeChild(overlay);
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!isSelecting) return;
      isSelecting = false;

      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      cleanup();

      // Only proceed if area is large enough
      if (width < 20 || height < 20) {
        reject(new Error('Selected area too small'));
        return;
      }

      try {
        // First capture full page
        const fullDataUrl = await captureScreenshot();

        // Create canvas to crop the selected area
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set canvas size to selected area
          canvas.width = width;
          canvas.height = height;

          // Draw the cropped portion
          ctx.drawImage(
            img,
            left, top, width, height,  // Source rectangle
            0, 0, width, height         // Destination rectangle
          );

          const croppedDataUrl = canvas.toDataURL('image/png');
          resolve(croppedDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load screenshot'));
        img.src = fullDataUrl;
      } catch (error) {
        reject(error);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup();
        reject(new Error('Screenshot cancelled'));
      }
    };

    overlay.addEventListener('mousedown', handleMouseDown);
    overlay.addEventListener('mousemove', handleMouseMove);
    overlay.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
  });
}

/**
 * Initialize console log tracking for bug reports
 * Call this once when the app loads
 */
export function initializeConsoleTracking() {
  if (typeof window === 'undefined') return;

  // Store logs in a global array
  (window as any).__feedbackConsoleLogs = [];

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args) {
    (window as any).__feedbackConsoleLogs.push({
      type: 'error',
      message: args.map(arg => String(arg)).join(' '),
      timestamp: new Date().toISOString(),
    });
    originalError.apply(console, args);
  };

  console.warn = function (...args) {
    (window as any).__feedbackConsoleLogs.push({
      type: 'warn',
      message: args.map(arg => String(arg)).join(' '),
      timestamp: new Date().toISOString(),
    });
    originalWarn.apply(console, args);
  };

  // Also track window errors
  window.addEventListener('error', (event) => {
    (window as any).__feedbackConsoleLogs.push({
      type: 'error',
      message: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      timestamp: new Date().toISOString(),
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    (window as any).__feedbackConsoleLogs.push({
      type: 'error',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      timestamp: new Date().toISOString(),
    });
  });
}
