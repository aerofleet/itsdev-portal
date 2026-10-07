import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({
 ...base,
 testMatch:'content.spec.ts',
 outputDir:'.codex/content-test-results',
 use:{baseURL:'http://127.0.0.1:4323'},
 webServer:{command:'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4323',url:'http://127.0.0.1:4323',reuseExistingServer:false,timeout:60000,env:{ITSDEV_CONTENT_FIXTURES:'1'}},
});
