const fs = require('fs');
const { execSync } = require('child_process');

function fixUrls() {
  const files = execSync('find src -type f -name "*.tsx" -o -name "*.ts"').toString().split('\n').filter(Boolean);
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // Using regex to replace category?.slug with subCategory?.slug ONLY where it's part of the article URL generator logic
    const regexes = [
      {
        find: /\$\{([a-zA-Z0-9_]+)\.category\?\.slug \|\| 'uncategorized'\}/g,
        replace: "${$1.subCategory?.slug || 'uncategorized'}"
      }
    ];

    for (const { find, replace } of regexes) {
      if (find.test(content)) {
        content = content.replace(find, replace);
        changed = true;
      }
    }
    
    // We also need to fix app/[...slug]/page.tsx where it does:
    // const catSlug = post.category?.slug || 'uncategorized';
    if (file.includes('src/app/[...slug]/page.tsx')) {
        content = content.replace(/const catSlug = post\.category\?\.slug \|\| 'uncategorized';/g, "const catSlug = post.subCategory?.slug || 'uncategorized';");
        changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

fixUrls();
