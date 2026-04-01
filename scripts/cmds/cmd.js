const fs = require("fs");
const path = require("path");
const axios = require("axios");

const configPath = path.join(__dirname, "..", "..", "config.json");

function loadConfig() {
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configData);

    // ✅ FIX: admins ensure
    if (!Array.isArray(config.admins)) config.admins = [];

    return config;
  } catch (error) {
    console.error("Error loading config.json:", error);
    return { admins: [] };
  }
}

module.exports = {
  config: {
    name: "cmd",
    aliases: ["command"],
    version: "2.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Manage commands system",
    usage: "cmd <install|loadall|load|unload|reload>",
    category: "admin",
    role: 2,
    usePrefix: true
  },

  async onStart({ message, args, userId }) {
    const config = loadConfig();

    // ✅ FIX: same system as main.js
    const isBotAdmin = (config.admins || []).includes(userId);

    if (!isBotAdmin) {
      return message.reply("❌ | Only bot admin can use this command.");
    }

    const subcmd = args[0]?.toLowerCase();
    const cmdFolder = __dirname;

    // ✅ FIX: use global.commands (main.js)
    const commands = global.commands;

    if (!subcmd) {
      return message.reply("⚠️ Usage: cmd <install|loadall|load|unload|reload>");
    }

    function clearRequireCache(filePath) {
      try {
        delete require.cache[require.resolve(filePath)];
      } catch {}
    }

    function registerCommand(cmd) {
      if (!cmd?.config?.name) return false;

      const name = cmd.config.name.toLowerCase();
      commands.set(name, cmd);

      if (Array.isArray(cmd.config.aliases)) {
        cmd.config.aliases.forEach(alias => {
          commands.set(alias.toLowerCase(), cmd);
        });
      }

      return true;
    }

    try {

      // ================= INSTALL =================
      if (subcmd === "install") {
        const fileName = args[1];
        const url = args[2];

        if (!fileName || !url)
          return message.reply("⚠️ cmd install <file.js> <url>");

        const filePath = path.join(cmdFolder, fileName);

        const res = await axios.get(url);
        fs.writeFileSync(filePath, res.data);

        clearRequireCache(filePath);
        const cmd = require(filePath);

        if (!registerCommand(cmd)) {
          fs.unlinkSync(filePath);
          return message.reply("❌ Invalid command");
        }

        return message.reply(`✅ Installed ${cmd.config.name}`);
      }

      // ================= LOAD ALL =================
      if (subcmd === "loadall") {
        commands.clear();

        const files = fs.readdirSync(cmdFolder).filter(f => f.endsWith(".js"));

        let ok = 0, fail = 0;

        for (const file of files) {
          try {
            const filePath = path.join(cmdFolder, file);

            clearRequireCache(filePath);
            const cmd = require(filePath);

            if (registerCommand(cmd)) ok++;
            else fail++;

          } catch {
            fail++;
          }
        }

        return message.reply(`✅ Loaded: ${ok}\n❌ Failed: ${fail}`);
      }

      // ================= UNLOAD =================
      if (subcmd === "unload") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd unload <name>");

        const cmd = commands.get(name);
        if (!cmd) return message.reply("❌ Not found");

        const realName = cmd.config.name.toLowerCase();
        const filePath = path.join(cmdFolder, realName + ".js");

        commands.delete(realName);
        (cmd.config.aliases || []).forEach(a => commands.delete(a));

        clearRequireCache(filePath);

        return message.reply(`✅ Unloaded ${realName}`);
      }

      // ================= LOAD =================
      if (subcmd === "load") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd load <name>");

        const filePath = path.join(cmdFolder, name + ".js");

        clearRequireCache(filePath);
        const cmd = require(filePath);

        if (!registerCommand(cmd))
          return message.reply("❌ Invalid");

        return message.reply(`✅ Loaded ${name}`);
      }

      // ================= RELOAD =================
      if (subcmd === "reload") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd reload <name>");

        const filePath = path.join(cmdFolder, name + ".js");

        clearRequireCache(filePath);
        const cmd = require(filePath);

        if (!registerCommand(cmd))
          return message.reply("❌ Invalid");

        return message.reply(`🔄 Reloaded ${name}`);
      }

      return message.reply("❌ Invalid subcommand");

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error: " + err.message);
    }
  }
};
