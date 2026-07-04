const fs = require('fs');
const path = require('path');
const dir = './src/components';
const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file contains 'uppercase'
    if (content.includes('uppercase')) {
      content = content.replace(/\buppercase\b/g, 'capitalize');
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
