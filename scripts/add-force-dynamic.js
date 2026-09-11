const fs = require("fs");
const path = require("path");

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (f === "route.ts") {
      let content = fs.readFileSync(fullPath, "utf8");
      if (!content.includes("export const dynamic")) {
        const lines = content.split("\n");
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("import ")) {
            lastImportIndex = i;
          }
        }
        if (lastImportIndex !== -1) {
          lines.splice(lastImportIndex + 1, 0, "", "export const dynamic = 'force-dynamic';", "");
        } else {
          lines.unshift("export const dynamic = 'force-dynamic';", "");
        }
        fs.writeFileSync(fullPath, lines.join("\n"), "utf8");
        console.log("Updated", fullPath);
      }
    }
  }
}

walk("src/app/api");
