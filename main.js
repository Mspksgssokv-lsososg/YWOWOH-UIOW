const fs = require("fs");
const path = require("path");
const express = require("express");

const c = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  pink: "\x1b[35m",
};

// Directories
const cmdsDir = path.join(__dirname, "scripts", "cmds");
const eventsDir = path.join(__dirname, "scripts", "events");

// Function to load JS modules
function loadJsFiles(dir, type) {
  if (!fs.existsSync(dir)) {
    console.warn(`${c.yellow}[WARN]${c.reset} No ${type} directory found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
  console.log(`${c.cyan}Loaded ${type}:${c.reset}`);
  files.forEach(file => {
    try {
      require(path.join(dir, file));
      console.log(`${c.green}[OK]${c.reset} ${file}`);
    } catch (err) {
      console.error(`${c.red}[ERROR]${c.reset} Failed to load ${file}: ${err.message}`);
    }
  });
}

// Load all commands and events
loadJsFiles(cmdsDir, "Commands");
loadJsFiles(eventsDir, "Events");

// Load root-level JS files (index.js, update.js, utils.js, etc.)
const rootJsFiles = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "main.js");
console.log(`${c.cyan}Loading root JS files:${c.reset}`);
rootJsFiles.forEach(file => {
  try {
    require(path.join(__dirname, file));
    console.log(`${c.green}[OK]${c.reset} ${file}`);
  } catch (err) {
    console.error(`${c.red}[ERROR]${c.reset} Failed to load ${file}: ${err.message}`);
  }
});

// Express server for 24/7 ping
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("🤖 Bot is running 24/7 ✅"));

app.listen(PORT, () => console.log(`${c.cyan}Web server live at http://localhost:${PORT}${c.reset}`));

process.on('unhandledRejection', reason => console.error('💥 Unhandled Rejection:', reason));

console.log(`${c.pink}✅ All modules loaded!${c.reset}`);
