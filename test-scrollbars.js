const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto('http://localhost:8888/test-excalidraw.html');

  // Wait for Excalidraw to load
  await page.waitForSelector('.excalidraw', { timeout: 10000 });
  await page.waitForTimeout(3000);

  // Check for scrollbars
  const scrollbarInfo = await page.evaluate(() => {
    const excalidrawEl = document.querySelector('.excalidraw');
    const canvasContainer = document.querySelector('.excalidraw-canvas-container');
    const results = [];

    if (excalidrawEl) {
      const hasVerticalScroll = excalidrawEl.scrollHeight > excalidrawEl.clientHeight;
      const hasHorizontalScroll = excalidrawEl.scrollWidth > excalidrawEl.clientWidth;
      const computedStyle = window.getComputedStyle(excalidrawEl);

      results.push('=== EXCALIDRAW ELEMENT ===');
      results.push(`Vertical scrollbar: ${hasVerticalScroll ? 'YES ❌' : 'NO ✅'}`);
      results.push(`Horizontal scrollbar: ${hasHorizontalScroll ? 'YES ❌' : 'NO ✅'}`);
      results.push(`overflow: ${computedStyle.overflow}`);
      results.push(`scrollbar-width: ${computedStyle.scrollbarWidth}`);
      results.push(`clientWidth: ${excalidrawEl.clientWidth}, scrollWidth: ${excalidrawEl.scrollWidth}`);
      results.push(`clientHeight: ${excalidrawEl.clientHeight}, scrollHeight: ${excalidrawEl.scrollHeight}`);
      results.push(`position: ${computedStyle.position}`);
    }

    if (canvasContainer) {
      const hasVerticalScroll = canvasContainer.scrollHeight > canvasContainer.clientHeight;
      const hasHorizontalScroll = canvasContainer.scrollWidth > canvasContainer.clientWidth;
      const computedStyle = window.getComputedStyle(canvasContainer);

      results.push('\n=== CANVAS CONTAINER ===');
      results.push(`Vertical scrollbar: ${hasVerticalScroll ? 'YES ❌' : 'NO ✅'}`);
      results.push(`Horizontal scrollbar: ${hasHorizontalScroll ? 'YES ❌' : 'NO ✅'}`);
      results.push(`overflow: ${computedStyle.overflow}`);
      results.push(`clientWidth: ${canvasContainer.clientWidth}, scrollWidth: ${canvasContainer.scrollWidth}`);
      results.push(`clientHeight: ${canvasContainer.clientHeight}, scrollHeight: ${canvasContainer.scrollHeight}`);
    }

    return results.join('\n');
  });

  console.log(scrollbarInfo);

  // Take screenshot
  await page.screenshot({ path: '/home/tom/XPShareV10/scrollbar-test.png' });
  console.log('\n✅ Screenshot saved to scrollbar-test.png');

  await browser.close();
})();
