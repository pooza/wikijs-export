const fs = require('fs');
const path = require('path');
const markdown = require('markdown-it')();
const glob = require('glob');

const sourceDir = './markdowns';
const destDir = './htmls';

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

function replaceLinks(markdownText) {
  return markdownText.replace(/\[([^\]]+)]\((\/[^)]+)\)/g, (_, text, link) => {
    const htmlPath = link.replace(/^\//, '').replace(/\//g, '_') + '.html';
    return `[${text}](${htmlPath})`;
  });
}

glob(`${sourceDir}/**/*.md`, (err, files) => {
  if (err) throw err;

  files.forEach((file) => {
    const md = fs.readFileSync(file, 'utf-8');
    const updatedMd = replaceLinks(md);
    const htmlContent = markdown.render(updatedMd);

    const relPath = path.relative(sourceDir, file);
    const fileName = relPath.replace(/\//g, '_').replace(/\.md$/, '.html');
    const title = fileName.replace(/\.html$/, '').replace(/_/g, '/');

    const breadcrumbs = {};
    const docpath = [];
    relPath
      .replace(/\.md/, '')
      .split('/')
      .map((part) => {
        docpath.push(part);
        breadcrumbs[part] = `${docpath.join('_')}.html`;
      });
    const breadcrumbLinks = Object.keys(breadcrumbs)
      .map((k) => {
        const v = breadcrumbs[k];
        return `<a href="${v}">${k}</a>`;
      })
      .join(' / ');

    let htmlPage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"><title>${title}</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 1em; }
    header { background: #f0f0f0; padding: 0.5em; }
    p { line-height: 1.5; }
    code { font-family: monospace; }
    img { width: 100%; max-width: 100%; }
  </style>
</head>
<body>
<header>
  ${breadcrumbLinks}
</header>
${htmlContent}
</body>
</html>`.trim();
    htmlPage = htmlPage.replace(/<h2[^>]*>title:[\s\S]*?<\/h2>/gi, '');
    const outPath = path.join(destDir, fileName);
    fs.writeFileSync(outPath, htmlPage);
    console.log(`Converted ${relPath} -> ${fileName}`);
  });
});
