import { defineConfig } from '@playwright/test';
import base from './playwright.content.config';
export default defineConfig({
 ...base,
 testMatch:'accessibility.spec.ts',
 outputDir:'.codex/accessibility-results',
 workers:2,
 projects:[
  {name:'desktop',use:{viewport:{width:1440,height:1000}}},
  {name:'narrow',use:{viewport:{width:320,height:800}}},
 ],
});
