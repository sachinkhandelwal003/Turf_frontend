const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
};

const search = () => {
  const files = walk('.');
  console.log(`Searching through ${files.length} files...`);
  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.toLowerCase().includes('/matches') || content.toLowerCase().includes('hostmatch') || content.toLowerCase().includes('creatematch')) {
      console.log(`Match found in file: ${file}`);
    }
  });
};

search();
