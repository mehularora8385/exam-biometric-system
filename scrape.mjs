import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('Going to URL...');
    await page.goto('https://mr-mehul-admin-frontend.vercel.app/', { waitUntil: 'networkidle2' });
    
    console.log('Typing credentials...');
    // Finding input fields (assuming standard type text and password)
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', 'demo');
    await page.type('input[type="password"]', 'demo');
    
    console.log('Clicking login button...');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('Current URL:', page.url());
    
    console.log('Extracting dashboard content...');
    const content = await page.evaluate(() => {
      const texts = [];
      document.querySelectorAll('h1, h2, h3, h4, h5, span, p, a, button, th, td, div.text-sm, div.font-bold').forEach(el => {
        if(el.innerText && el.innerText.trim().length > 0) texts.push(el.tagName + ': ' + el.innerText.trim());
      });
      return texts;
    });
    
    const uniqueContent = [...new Set(content)];
    console.log('Dashboard text elements:', uniqueContent.slice(0, 100).join('\n'));
    
    // Check if there are specific sections or a sidebar
    const sidebarLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.map(a => a.innerText.trim()).filter(t => t.length > 0);
    });
    console.log('\nNavigation/Sidebar links:', [...new Set(sidebarLinks)].join(', '));
    
    await browser.close();
  } catch (e) {
    console.error('Error:', e);
  }
})();