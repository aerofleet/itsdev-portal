import { defineConfig } from 'astro/config';
import readable from './scripts/rehype-readable.mjs';
import { unified } from '@astrojs/markdown-remark';
export default defineConfig({
  site: 'https://itsdev.kr',
  output: 'static',
  outDir: process.env.ITSDEV_CONTENT_FIXTURES==='1'?'./.codex/content-dist':'./dist',
  cacheDir: process.env.ITSDEV_CONTENT_FIXTURES==='1'?'./.codex/content-cache':'./node_modules/.astro',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: { processor: unified({ rehypePlugins: [readable] }) },
});
