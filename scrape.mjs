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
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', 'demo');
    await page.type('input[type="password"]', 'demo');
    
    console.log('Clicking login button...');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })).filter(l => l.text);
    });
    
    const pagesToScrape = ['Exams', 'Centres', 'Operators', 'Candidates', 'Generate APK', 'Audit Logs'];
    
    for (const linkText of pagesToScrape) {
      const link = links.find(l => l.text === linkText);
      if (link) {
        console.log(`\n\n--- Scraping ${linkText} (${link.href}) ---`);
        await page.goto(link.href, { waitUntil: 'networkidle2' });
        
        // Wait for table to load if any
        await new Promise(r => setTimeout(r, 1000));
        
        const content = await page.evaluate(() => {
          const texts = [];
          
          // Let's get table headers and first row to understand the structure
          const tables = document.querySelectorAll('table');
          tables.forEach(table => {
            texts.push('TABLE HEADERS:');
            const ths = Array.from(table.querySelectorAll('th')).map(th => th.innerText.trim());
            texts.push(ths.join(' | '));
            
            texts.push('FIRST ROW:');
            const firstRow = table.querySelector('tbody tr');
            if (firstRow) {
              const tds = Array.from(firstRow.querySelectorAll('td')).map(td => td.innerText.trim());
              texts.push(tds.join(' | '));
            }
          });
          
          // Get forms/inputs
          document.querySelectorAll('input, select, button').forEach(el => {
             if (el.tagName === 'BUTTON') texts.push('BUTTON: ' + el.innerText.trim());
             if (el.tagName === 'INPUT') texts.push('INPUT placeholder: ' + el.placeholder);
          });
          
          return texts;
        });
        
        console.log(content.join('\n'));
      }
    }
    
    await browser.close();
  } catch (e) {
    console.error('Error:', e);
  }
})();