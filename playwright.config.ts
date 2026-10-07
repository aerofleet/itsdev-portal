import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 testMatch:'portal.spec.ts',
 globalTeardown:'./tests/global-teardown.ts',
 outputDir:'.codex/test-results',
 reporter:[['list']],
 use:{baseURL:'http://127.0.0.1:4322'},
 projects:[
  {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},
  {name:'tablet',use:{...devices['Desktop Chrome'],viewport:{width:768,height:1000}}},
  {name:'mobile',use:{...devices['Desktop Chrome'],viewport:{width:390,height:844}}},
  {name:'narrow',use:{...devices['Desktop Chrome'],viewport:{width:320,height:800}}},
 ],
 webServer:{command:'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322',url:'http://127.0.0.1:4322',reuseExistingServer:false,timeout:60000}
});
