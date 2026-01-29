const fs = require("fs");
const path = require("path");

function scan(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.lstatSync(full).isDirectory()) {
      scan(full);
    } else if (file.endsWith(".json")) {
      try {
        JSON.parse(fs.readFileSync(full, "utf8"));
      } catch (e) {
        console.log("❌ Broken JSON:", full);
      }
    }
  }
}

scan("./");
