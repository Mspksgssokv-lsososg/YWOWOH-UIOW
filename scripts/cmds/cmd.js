const fs = require("fs");
const path = require("path");
const axios = require("axios");
 
const configPath = path.join(__dirname, "..", "..", "config.json");
 
function loadConfig() {
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configData);
    if (!config.admin) config.admin = [];
    return config;
  } catch (error) {
    console.error("Error loading config.json:", error);
    return { admin: [] };
  }
}
 
module.exports = {
  config: {
    name: "cmd",
    aliases: ["command"],
    version: "1.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Manage commands: install, loadall, load, unload, reload",
    usage: "cmd <install|loadall|load|unload|reload> [args]",
    category: "admin",
    role: 2,
    prefix: false
  },
 
  async onStart({ message, args, userId }) {
    const config = loadConfig();
 
    if (!config.admin.includes(String(userId))) {
      return message.reply("❌ | Only bot's admin can use this command.");
    }
 
    const subcmd = args[0]?.toLowerCase();
    const cmdFolder = path.join(__dirname, "./");
 
    if (!global.bot || !global.bot.cmds) {
      global.bot = { cmds: new Map() };
    }
    const commands = global.bot.cmds;
 
    if (!subcmd) {
      return message.reply("⚠️ Usage: cmd <install|loadall|load|unload|reload> [args]");
    }
 
    function clearRequireCache(filePath) {
      try {
        const resolvedPath = require.resolve(filePath);
        if (require.cache[resolvedPath]) {
          delete require.cache[resolvedPath];
        }
      } catch (err) {
        console.error("Failed to clear require cache:", err);
      }
    }
 
    function registerCommand(cmd, commandsCollection) {
      if (!cmd || !cmd.config || typeof cmd.config.name !== "string" || typeof cmd.onStart !== "function") {
        return false;
      }
      const nameLower = cmd.config.name.toLowerCase();
      commandsCollection.set(nameLower, cmd);
      if (Array.isArray(cmd.config.aliases)) {
        for (const alias of cmd.config.aliases) {
          const aliasLower = alias.toLowerCase();
          if (!commandsCollection.has(aliasLower)) {
            commandsCollection.set(aliasLower, cmd);
          }
        }
      }
      return true;
    }
 
    try {
      if (subcmd === "install") {
        const fileName = args[1];
        const url = args[2];
 
        if (!fileName || !url || !fileName.endsWith(".js")) {
          return message.reply("⚠️ Usage: cmd install <filename.js> <URL>");
        }
 
        const filePath = path.join(cmdFolder, fileName);
        if (fs.existsSync(filePath)) {
          return message.reply(`❌ File '${fileName}' already exists. Unload/reload first.`);
        }
 
        let code;
        try {
          const response = await axios.get(url);
          code = response.data;
        } catch (err) {
          return message.reply(`❌ Failed to fetch code.\nReason: ${err.message}`);
        }
 
        try {
          fs.writeFileSync(filePath, code, "utf-8");
        } catch (err) {
          console.error("Write File Error:", err);
          return message.reply(`❌ Failed to write file.\nReason: ${err.message}`);
        }
 
        try {
          clearRequireCache(filePath);
          const loadedCmd = require(filePath);
          if (!registerCommand(loadedCmd, commands)) {
            fs.unlinkSync(filePath);
            return message.reply("❌ Invalid command format. Aborted.");
          }
          return message.reply(`✅ Installed command "${loadedCmd.config.name}" successfully.`);
        } catch (err) {
          console.error("Install Load Error:", err);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return message.reply(`❌ Failed to load command.\nReason: ${err.message}`);
        }
      }
 
      else if (subcmd === "loadall") {
        commands.clear();
        const files = fs.readdirSync(cmdFolder).filter(f => f.endsWith(".js"));
        let loaded = 0, failed = 0, failedMessages = "";
 
        for (const file of files) {
          try {
            const filePath = path.join(cmdFolder, file);
            clearRequireCache(filePath);
            const cmd = require(filePath);
            if (registerCommand(cmd, commands)) {
              loaded++;
            } else {
              failed++;
              failedMessages += ` ❗ ${file} => Invalid format\n`;
            }
          } catch (err) {
            failed++;
            failedMessages += ` ❗ ${file} => ${err.name}: ${err.message}\n`;
          }
        }
 
        let replyMsg = `✅ Loaded: ${loaded} command(s).`;
        if (failed > 0) replyMsg += `\n❌ Failed: ${failed}\n${failedMessages}`;
        return message.reply(replyMsg);
      }
 
      else if (subcmd === "unload") {
        const cmdName = args[1]?.toLowerCase();
        if (!cmdName) return message.reply("⚠️ Specify a command to unload.");
        const targetCmd = commands.get(cmdName);
        if (!targetCmd) return message.reply(`❌ Command '${cmdName}' not found.`);
 
        const originalName = targetCmd.config.name.toLowerCase();
        const filePath = path.join(cmdFolder, `${originalName}.js`);
        if (!fs.existsSync(filePath)) {
          return message.reply(`❌ File '${originalName}.js' not found.`);
        }
 
        try {
          const aliases = [originalName, ...(targetCmd.config.aliases || [])].map(a => a.toLowerCase());
          aliases.forEach(alias => commands.delete(alias));
          clearRequireCache(filePath);
          fs.renameSync(filePath, filePath.replace(".js", ".txt"));
          return message.reply(`✅ Unloaded command "${originalName}"`);
        } catch (err) {
          console.error("Unload Error:", err);
          return message.reply(`❌ Failed to unload.\nReason: ${err.message}`);
        }
      }
 
      else if (subcmd === "load") {
        const cmdName = args[1]?.toLowerCase();
        if (!cmdName) return message.reply("⚠️ Specify a command to load.");
        const jsPath = path.join(cmdFolder, `${cmdName}.js`);
        const txtPath = path.join(cmdFolder, `${cmdName}.txt`);
 
        let finalPath = jsPath;
        if (!fs.existsSync(jsPath)) {
          if (fs.existsSync(txtPath)) {
            fs.renameSync(txtPath, jsPath);
          } else {
            return message.reply("❌ Command file not found.");
          }
        }
 
        try {
          clearRequireCache(finalPath);
          const cmd = require(finalPath);
          if (!registerCommand(cmd, commands)) throw new Error("Invalid format");
          return message.reply(`✅ Loaded command "${cmdName}" successfully.`);
        } catch (err) {
          return message.reply(`❌ Failed to load '${cmdName}'.\nReason: ${err.message}`);
        }
      }
 
      else if (subcmd === "reload") {
        const cmdName = args[1]?.toLowerCase();
        if (!cmdName) return message.reply("⚠️ Specify a command to reload.");
        const targetCmd = commands.get(cmdName);
        if (!targetCmd) return message.reply(`❌ Command '${cmdName}' not found.`);
 
        const originalName = targetCmd.config.name.toLowerCase();
        const filePath = path.join(cmdFolder, `${originalName}.js`);
        if (!fs.existsSync(filePath)) {
          return message.reply(`❌ File '${originalName}.js' not found.`);
        }
 
        try {
          const aliases = [originalName, ...(targetCmd.config.aliases || [])].map(a => a.toLowerCase());
          aliases.forEach(alias => commands.delete(alias));
          clearRequireCache(filePath);
          const cmd = require(filePath);
          if (!registerCommand(cmd, commands)) throw new Error("Invalid format after reload");
          return message.reply(`🔄 Reloaded "${originalName}" successfully.`);
        } catch (err) {
          return message.reply(`❌ Failed to reload '${cmdName}'.\nReason: ${err.message}`);
        }
      }
 
      else {
        return message.reply("❌ Unknown subcommand. Use install, loadall, load, unload, or reload.");
      }
 
    } catch (err) {
      console.error("CMD Handler Error:", err);
      return message.reply(`❌ Unexpected error.\nReason: ${err.message}`);
    }
  }
};
 
