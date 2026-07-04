const fs = require('fs');
const path = require('path');
const dir = './src/components';
const files = fs.readdirSync(dir);

const replacements = {
  'bg-white': 'bg-white dark:bg-[#0f172a]',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-900/50',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800/50',
  'border-slate-100': 'border-slate-100 dark:border-white/5',
  'border-slate-200': 'border-slate-200 dark:border-white/10',
  'text-slate-900': 'text-slate-900 dark:text-white',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-200',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'divide-slate-50': 'divide-slate-50 dark:divide-white/5'
};

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`(?<!dark:)\\b${key}\\b(?!\\s+dark:)`, 'g');
      content = content.replace(regex, value);
    }
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Dark mode classes added to src/components');
