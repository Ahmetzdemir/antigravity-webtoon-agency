import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    });

    const page = await browser.newPage();
    
    // Set viewport to a typical desktop size
    await page.setViewport({ width: 1280, height: 1080 });
    
    // Spoof user agent to avoid basic bot blocks
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Navigating to: ${url}`);
    
    // Navigate with a slightly relaxed timeout and waitUntil
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('Page loaded. Auto-scrolling to bypass lazy loading...');

    // Function to auto-scroll to the bottom of the page
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          // Stop scrolling when reached the bottom or a max limit to prevent infinite loops
          if (totalHeight >= scrollHeight || totalHeight > 50000) {
            clearInterval(timer);
            resolve();
          }
        }, 150); // 150ms delay between scroll steps
      });
    });

    // Wait a bit more for the last images to trigger loading
    await new Promise(r => setTimeout(r, 2000));

    // Extract image URLs
    console.log('Extracting image URLs...');
    const imageUrls = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const validImages: { src: string, top: number }[] = [];

      imgs.forEach((img) => {
        // Try getting the src or data-src (common for lazy loading)
        let src = img.getAttribute('data-src') || img.getAttribute('src');
        
        if (!src) return;

        // Clean up URL if it starts with //
        if (src.startsWith('//')) {
          src = 'https:' + src;
        } else if (src.startsWith('/')) {
          src = window.location.origin + src;
        }

        const rect = img.getBoundingClientRect();
        
        // Skip images that are completely invisible/hidden
        if (rect.width === 0 && rect.height === 0 && img.naturalWidth === 0) return;

        const width = img.naturalWidth || rect.width || img.width || 0;
        const height = img.naturalHeight || rect.height || img.height || 0;

        // Discard obviously tiny images like 1x1 or 50x50 UI icons
        if ((width > 0 && width < 300) || (height > 0 && height < 100)) return;

        // Skip obvious ads/ui elements using keywords in URL or class
        const srcLower = src.toLowerCase();
        const badKeywords = ['logo', 'icon', 'banner', 'avatar', 'thumb'];
        if (badKeywords.some(keyword => srcLower.includes(keyword))) return;

        const absoluteTop = rect.top + window.scrollY;

        if (!validImages.some(v => v.src === src)) {
          validImages.push({ src, top: absoluteTop });
        }
      });

      // Sort images strictly by their vertical position on the page (top to bottom)
      validImages.sort((a, b) => a.top - b.top);

      return validImages.map(v => v.src);
    });

    await browser.close();

    console.log(`Found ${imageUrls.length} valid comic images.`);

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: 'No comic images found on this page.' }, { status: 404 });
    }

    // Now, download these images via server-side fetch to bypass CORS issues on the client
    // and encode them as Base64 strings
    console.log('Downloading images down to server...');
    const base64Images: string[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const imgResponse = await fetch(imageUrls[i], {
          headers: {
            'Referer': url,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (!imgResponse.ok) continue;

        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
        
        const base64Str = `data:${contentType};base64,${buffer.toString('base64')}`;
        base64Images.push(base64Str);
      } catch (err) {
        console.warn(`Failed to download image ${imageUrls[i]}`, err);
      }
    }

    console.log(`Successfully fetched and encoded ${base64Images.length} images.`);

    return NextResponse.json({ images: base64Images });

  } catch (error: any) {
    console.error('URL Fetcher Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch the URL' }, { status: 500 });
  }
}
