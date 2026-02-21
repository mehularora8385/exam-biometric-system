import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://mr-mehul-admin-frontend.vercel.app/', { waitUntil: 'networkidle2' });
    
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', 'demo');
    await page.type('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    await page.goto('https://mr-mehul-admin-frontend.vercel.app/exams', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); // Wait for table
    
    const content = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const texts = [];
      tables.forEach(table => {
        const ths = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
        texts.push('HEADERS: ' + ths.join(' | '));
        const firstRow = table.querySelector('tbody tr');
        if (firstRow) {
           const tds = Array.from(firstRow.querySelectorAll('td')).map(td => td.innerText.trim());
           texts.push('ROW: ' + tds.join(' | '));
        }
      });
      return texts;
    });
    console.log('EXAM TABLE:', content);
    await browser.close();
  } catch(e) { console.error(e); }
})();