import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Checked-in static asset: Chromium is needed only when regenerating the artwork.
const font = (await readFile(new URL('../src/assets/pretendard-subset.woff2', import.meta.url))).toString('base64');
const browser = await chromium.launch();
try {
 const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
 await page.setContent(`<!doctype html><html lang="en"><head><style>
 @font-face{font-family:Card;src:url(data:font/woff2;base64,${font})}*{box-sizing:border-box}
 body{margin:0;background:#161916;color:#f5f6ef;font-family:Card,sans-serif}
 main{height:630px;padding:56px 64px;position:relative;overflow:hidden}
 header{display:flex;align-items:center;gap:14px;font-size:27px;font-weight:800;letter-spacing:-1px}
 .mark{background:#c6f36b;color:#161916;width:38px;height:38px;border-radius:10px;text-align:center;line-height:38px}
 .label{margin:52px 0 18px;color:#c6f36b;font-size:16px;letter-spacing:3px}
 h1{font-size:86px;line-height:1.02;letter-spacing:-4px;margin:0;font-weight:800;position:relative;z-index:1}
 h1 span{color:#c6f36b}footer{position:absolute;bottom:48px;left:64px;right:64px;display:flex;justify-content:space-between;border-top:1px solid #41483c;padding-top:23px;font-size:16px;color:#b5bdac}
 svg{position:absolute;right:25px;top:118px;width:330px;height:370px;opacity:.65}
 </style></head><body><main><header><span class="mark">i</span>ITSDEV</header>
 <p class="label">ENGINEERING FIELDNOTES</p><h1>Build. Operate.<br><span>Leave evidence.</span></h1>
 <svg viewBox="0 0 330 370" fill="none" aria-hidden="true"><g stroke="#73845b"><path d="M70 40H260V140H70zM35 205H225V305H35z"/><path d="M70 40L35 205M260 40L225 205M260 140L225 305M70 140L35 305"/><path d="M165 90V255M70 90H260M35 255H225" stroke-dasharray="5 8"/></g><g fill="#c6f36b"><circle cx="70" cy="40" r="6"/><circle cx="260" cy="140" r="6"/><circle cx="35" cy="305" r="6"/><circle cx="165" cy="90" r="7"/></g></svg>
 <footer><span>INFRASTRUCTURE / BACKEND / AI</span><span>itsdev.kr</span></footer></main></body></html>`);
 await page.evaluate(() => document.fonts.ready);
 await mkdir(new URL('../public/images/', import.meta.url), { recursive: true });
 await page.screenshot({ path: fileURLToPath(new URL('../public/images/fieldnotes-og.png', import.meta.url)) });
 console.log('Generated public/images/fieldnotes-og.png (1200 × 630)');
} finally { await browser.close(); }
