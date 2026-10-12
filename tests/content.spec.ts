import { test, expect } from '@playwright/test';
test('pending clipboard write preserves focus and rejects duplicate activation', async ({ page }) => {
 await page.goto('/articles/qa-record-01/');
 await page.evaluate(() => {
  const state = window as typeof window & { finishCopy: () => void; copyCalls: number };
  state.copyCalls = 0;
  Object.defineProperty(navigator.clipboard, 'writeText', { value: () => {
   state.copyCalls++;
   return new Promise<void>(resolve => { state.finishCopy = resolve; });
  } });
 });
 const copy = page.getByRole('button', { name: '코드 1 복사', exact: true });
 await copy.focus(); await page.keyboard.press('Enter');
 await expect(copy).toHaveAttribute('aria-disabled', 'true');
 await expect(copy).toBeFocused();
 await page.keyboard.press('Enter');
 expect(await page.evaluate(() => (window as typeof window & { copyCalls: number }).copyCalls)).toBe(1);
 await page.evaluate(() => (window as typeof window & { finishCopy: () => void }).finishCopy());
 await expect(page.getByRole('status').first()).toHaveText('코드를 복사했습니다.');
 await expect(copy).toBeFocused();
});
test('motion cards, copy feedback, hash navigation and off switch', async ({ page, context }) => {
 await context.grantPermissions(['clipboard-read', 'clipboard-write']);
 await page.goto('/articles/');
 const card=page.locator('.article-card').first();
 await card.locator('a').first().focus();
 await expect.poll(()=>card.evaluate(e=>getComputedStyle(e).transform)).not.toBe('none');
 await page.evaluate(()=>document.documentElement.dataset.motion='off');
 await expect(card).toHaveCSS('transform','none');
 await page.goto('/articles/qa-record-01/');
 const copy=page.getByRole('button',{name:'코드 1 복사',exact:true});
 await copy.focus(); await page.keyboard.press('Enter');
 await expect(page.getByRole('status').first()).toHaveText('코드를 복사했습니다.');
 await expect(copy).toBeFocused();
 expect((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n')).toBe(await page.locator('.prose pre code').first().textContent());
 await page.locator('.toc a').first().click();
 expect(new URL(page.url()).hash).not.toBe('');
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('html')).toHaveCSS('scroll-behavior','auto');
 await expect(copy).toHaveCSS('transition-duration','0s');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('static pagination and category navigation',async({page},info)=>{
 await page.goto('/articles/');await expect(page.locator('.article-card')).toHaveCount(12);
 await page.getByRole('link',{name:'다음 페이지',exact:true}).click();await expect(page).toHaveURL(/\/articles\/2\/$/);await expect(page.locator('.article-card')).toHaveCount(2);
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://itsdev.kr/articles/2/');
 await page.getByRole('link',{name:'인프라',exact:true}).click();await expect(page.locator('.article-card')).toHaveCount(12);
 await expect(page.getByRole('link',{name:'인프라',exact:true})).toHaveAttribute('aria-current','page');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.codex/${info.project.name}-article-list.png`,fullPage:true});
 await page.getByRole('link',{name:'다음 페이지',exact:true}).click();await expect(page.locator('.article-card')).toHaveCount(1);
});
test('article, table, code, revisions and theme',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/articles/qa-record-01/');await expect(page.locator('h1')).toContainText('[검증용]');
 await expect(page.locator('.revision-table tbody tr')).toHaveCount(2);
 await expect(page.locator('.revision-table .latest')).toContainText('REV B');
 await expect(page.locator('.related-records .article-card')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.codex/${info.project.name}-article.png`,fullPage:true});
 await page.getByRole('navigation',{name:'목차',exact:true}).getByRole('link',{name:'검증 조건',exact:true}).click();await expect(page).toHaveURL(/#/);
 await page.locator('#theme').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.codex/${info.project.name}-article-light.png`,fullPage:true});
 await expect(page.locator('.prose pre')).toHaveAttribute('tabindex','0');await expect(page.getByRole('region',{name:'본문 표'})).toHaveAttribute('tabindex','0');
 const table=page.getByRole('region',{name:'본문 표'});
 if(await table.evaluate(el=>el.scrollWidth>el.clientWidth)){
  await table.focus();await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 }
 expect(errors).toEqual([]);
});
test('no JS reading and 200 percent text',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:info.project.use.viewport});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4323/articles/qa-record-01/');await expect(page.locator('.prose')).toBeVisible();
 await page.getByRole('navigation',{name:'목차',exact:true}).getByRole('link',{name:'한계',exact:true}).click();await expect(page).toHaveURL(/#/);
 await context.close();
 const enlargedContext=await browser.newContext({viewport:info.project.use.viewport});const enlarged=await enlargedContext.newPage();
 await enlarged.goto('http://127.0.0.1:4323/articles/qa-record-01/');
 await enlarged.addStyleTag({content:'.reading-body .prose{font-size:34px}.document-header h1{font-size:64px}'});
 expect(await enlarged.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await enlargedContext.close();
});
