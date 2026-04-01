const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "cmd",
    aliases: ["command"],
    version: "3.1.0",
    author: "SK-SIDDIK-KHAN",
    description: "Manage commands system",
    usage: "cmd <install|loadall|load|unload|reload>",
    category: "admin",
    role: 2,
    usePrefix: true
  },

  async onStart({ message, args, event }) {
    try {
      const userId = event.from.id;

      const isBotAdmin = (global.config.admins || []).some(
        id => String(id) === String(userId)
      );

      if (!isBotAdmin) {
        return message.reply("❌ | Only bot admin can use this command");
      }

      const subcmd = args[0]?.toLowerCase();
      const cmdFolder = __dirname;
      const commands = global.commands;

      if (!subcmd) {
        return message.reply("⚠️ Usage: cmd <install|loadall|load|unload|reload>");
      }

      const clearCache = (filePath) => {
        try {
          delete require.cache[require.resolve(filePath)];
        } catch {}
      };

      const register = (cmd) => {
        if (!cmd?.config?.name) return false;

        const name = cmd.config.name.toLowerCase();

        commands.forEach((value, key) => {
          if (value.config?.name?.toLowerCase() === name) {
            commands.delete(key);
          }
        });

        commands.set(name, cmd);

        if (Array.isArray(cmd.config.aliases)) {
          cmd.config.aliases.forEach(a => {
            commands.set(a.toLowerCase(), cmd);
          });
        }

        return true;
      };

      if (subcmd === "install") {
        const fileName = args[1];
        const url = args[2];

        if (!fileName || !url) {
          return message.reply("⚠️ cmd install <file.js> <url>");
        }

        const filePath = path.join(cmdFolder, fileName);

        const res = await axios.get(url);
        fs.writeFileSync(filePath, res.data, "utf-8");

        clearCache(filePath);
        const cmd = require(filePath);

        if (!register(cmd)) {
          fs.unlinkSync(filePath);
          return message.reply("❌ Invalid command file");
        }

        return message.reply(`✅ Installed: ${cmd.config.name}`);
      }

      if (subcmd === "loadall") {
        const files = fs.readdirSync(cmdFolder).filter(f => f.endsWith(".js"));

        let ok = 0, fail = 0;

        for (const file of files) {
          try {
            const filePath = path.join(cmdFolder, file);

            clearCache(filePath);
            const cmd = require(filePath);

            if (register(cmd)) ok++;
            else fail++;

          } catch (e) {
            console.log("LoadAll Error:", e.message);
            fail++;
          }
        }

        if (fail === 0) {
          return message.reply(`✅ Command Loaded Successfully : ${ok}`);
        } else {
          return message.reply(`✅ Loaded: ${ok}\n❌ Failed: ${fail}`);
        }
      }

      if (subcmd === "unload") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd unload <name>");

        const cmd = commands.get(name);
        if (!cmd) return message.reply("❌ Command not found");

        const realName = cmd.config.name.toLowerCase();

        commands.delete(realName);
        (cmd.config.aliases || []).forEach(a => commands.delete(a));

        return message.reply(`✅ Unloaded: ${realName}`);
      }

      if (subcmd === "load") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd load <name>");

        const filePath = path.join(cmdFolder, name + ".js");

        if (!fs.existsSync(filePath)) {
          return message.reply("❌ File not found");
        }

        clearCache(filePath);
        const cmd = require(filePath);

        if (!register(cmd)) {
          return message.reply("❌ Invalid command");
        }

        return message.reply(`✅ Loaded: ${name}`);
      }

      if (subcmd === "reload") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd reload <name>");

        const filePath = path.join(cmdFolder, name + ".js");

        if (!fs.existsSync(filePath)) {
          return message.reply("❌ File not found");
        }

        clearCache(filePath);
        const cmd = require(filePath);

        if (!register(cmd)) {
          return message.reply("❌ Invalid command");
        }

        return message.reply(`🔄 Reloaded: ${name}`);
      }

      return message.reply("❌ Invalid subcommand");

    } catch (err) {
      console.error("CMD ERROR:", err);
      return message.reply("❌ Error: " + err.message);
    }
  }
};
