const fs = require('fs');
const path = require('path');
const markdown = require('markdown-it')();
const glob = require('glob');

const INPUT_DIR = './markdowns';
const OUTPUT_DIR = './htmls';

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

function replaceLinks(markdownText) {
  return markdownText.replace(/\[([^\]]+)]\((\/[^\)]+)\)/g, (_, text, link) => {
    const htmlPath = link.replace(/^\//, '').replace(/\//g, '_') + '.html';
    return `[${text}](${htmlPath})`;
  });
}

glob(`${INPUT_DIR}/**/*.md`, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
    const md = fs.readFileSync(file, 'utf-8');
    const updatedMd = replaceLinks(md);
    const htmlContent = markdown.render(updatedMd);

    const relPath = path.relative(INPUT_DIR, file);
    const fileName = relPath.replace(/\//g, '_').replace(/\.md$/, '.html');
    const title = fileName.replace(/\.html$/, '').replace(/_/g, '/');
    let htmlPage = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body>
<header>
    <a href="太陽_設計書.html">太陽_設計書</a>
</header>
${htmlContent}
</body>
</html>`.trim();
    htmlPage = htmlPage.replace(/<h2[^>]*>title:[\s\S]*?<\/h2>/gi, '');


    const outPath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(outPath, htmlPage);
    console.log(`Converted ${relPath} -> ${fileName}`);
  });
});
