import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const routes=['/','/articles/','/articles/2/','/articles/category/infra/','/articles/qa-record-01/','/services/','/services/djc/','/services/withbuddy/','/about/','/contact/','/privacy/','/terms/','/not-found/'];
for(const theme of ['dark','light'])for(const route of routes){
 test(`${theme} ${route}`,async({page},info)=>{
  await page.addInitScript(value=>localStorage.setItem('itsdev-theme',value),theme);
  await page.goto(route);
  await page.evaluate(()=>document.fonts.ready);
  // Include the content exposed by native disclosure controls.
  await page.locator('details').evaluateAll(items=>items.forEach(item=>item.setAttribute('open','')));
  // Audit settled text contrast, not a translucent entrance frame. Motion
  // behavior and reduced-motion cancellation are checked in portal.spec.ts.
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  await expect(page.locator('[data-reveal-state="running"]')).toHaveCount(0);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  const reportPath=info.outputPath('axe-report.json');
  await writeFile(reportPath,JSON.stringify({url:page.url(),theme,viewport:page.viewportSize(),violations:result.violations,incomplete:result.incomplete},null,2));
  await info.attach('axe-report',{path:reportPath,contentType:'application/json'});
  expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
