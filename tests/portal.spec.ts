import { test, expect } from '@playwright/test';
test('entrance and scroll reveal once, with keyboard and reduced-motion escape',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await expect(page.locator('#hub-title')).toHaveAttribute('data-reveal-state','done');
 const section=page.locator('.hub-method > header');
 await expect(section).not.toHaveAttribute('data-reveal-state',/running|done/);
 await section.scrollIntoViewIfNeeded();
 await expect(section).toHaveAttribute('data-reveal-state','done');
 await page.evaluate(()=>scrollTo(0,0));await section.scrollIntoViewIfNeeded();
 expect(await section.evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('[data-reveal-state="running"]')).toHaveCount(0);
 await expect(section).toHaveCSS('opacity','1');
});
test('home, category navigation, theme and motion',async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('h1')).toContainText('근거를 남깁니다.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.codex/${testInfo.project.name}-home.png`,fullPage:true});
 await expect(page.getByRole('button',{name:'다크 모드',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('#theme').focus();await page.keyboard.press('Enter');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(page.locator('#theme')).toHaveAttribute('aria-pressed','false');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.codex/${testInfo.project.name}-light.png`,fullPage:true});
 await page.locator('.hub-method summary').first().click();await expect(page.locator('.hub-method details').first()).toHaveAttribute('open','');
 await page.locator('#theme').click();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('#motion')).toHaveCount(0);
 await page.getByRole('link',{name:'인프라',exact:true}).click();await expect(page).toHaveURL(/\/articles\/category\/infra\/$/);
 await expect(page.locator('h1')).toHaveText('인프라');expect(errors).toEqual([]);
});
test('JS off reading and reduced motion',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:800}});const page=await context.newPage();
 await page.goto('http://127.0.0.1:4322/');await expect(page.locator('h1')).toBeVisible();await expect(page.locator('#theme')).toBeHidden();
 await page.locator('.hub-method summary').first().click();await expect(page.locator('.hub-method details').first()).toHaveAttribute('open','');
 await page.getByRole('link',{name:'전체 기록',exact:true}).click();await expect(page.locator('h1')).toBeVisible();await context.close();
 const reduced=await browser.newContext({reducedMotion:'reduce'});const reducedPage=await reduced.newPage();await reducedPage.goto('http://127.0.0.1:4322/');await expect(reducedPage.locator('html')).toHaveAttribute('data-motion','off');await reduced.close();
});
test('unknown URL returns 404 and references are private',async({request})=>{
 expect((await request.get('/not-a-real-record/')).status()).toBe(404);
 expect((await request.get('/docs/references/prd.md')).status()).toBe(404);
 expect((await request.get('/articles/editorial-template/')).status()).toBe(404);
});
