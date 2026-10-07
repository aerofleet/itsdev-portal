import { execFileSync } from 'node:child_process';
export default function teardown(){
 // Stop this project's preview through Astro's own lock-aware CLI.
 execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','preview','stop'],{stdio:'pipe',windowsHide:true,timeout:15000});
}
