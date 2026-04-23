import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';

export async function renderPage(url: string, options?: { vite?: any }): Promise<string> {
  let template: string;
  let render: (url: string) => Promise<{ html: string; head?: string }>;

  if (isDev && options?.vite) {
    const vite = options.vite;
    const templatePath = path.resolve(__dirname, '../index.html');
    template = fs.readFileSync(templatePath, 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    const mod = await vite.ssrLoadModule('/src/client/entry-server.tsx');
    render = mod.render;
  } else {
    const templatePath = path.resolve(__dirname, '../dist/client/index.html');
    template = fs.readFileSync(templatePath, 'utf-8');
    const serverEntry = path.resolve(__dirname, '../dist/server/entry-server.js');
    const mod = await import(serverEntry);
    render = mod.render;
  }

  const { html: appHtml, head: headTags = '' } = await render(url);

  const finalHtml = template
    .replace('<!--head-tags-->', headTags)
    .replace('<!--app-html-->', appHtml);

  return finalHtml;
}
