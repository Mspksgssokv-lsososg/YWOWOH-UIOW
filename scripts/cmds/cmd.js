const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "cmd",
    aliases: ["command"],
    version: "3.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Manage commands system",
    usage: "cmd <install|loadall|load|unload|reload>",
    category: "admin",
    role: 2,
    usePrefix: true
  },

  async onStart({ message, args, event }) {
    const userId = event.from.id;

    // ✅ MAIN.JS STYLE ADMIN CHECK (NO CONFIG LOAD)
    const isBotAdmin = (global.config.admins || []).some(id => String(id) === String(userId));

    if (!isBotAdmin) {
      return message.reply("❌ | Only bot admin can use this command.");
    }

    const subcmd = args[0]?.toLowerCase();
    const cmdFolder = __dirname;
    const commands = global.commands;

    if (!subcmd) {
      return message.reply("⚠️ Usage: cmd <install|loadall|load|unload|reload>");
    }

    function clearCache(filePath) {
      try {
        delete require.cache[require.resolve(filePath)];
      } catch {}
    }

    function register(cmd) {
      if (!cmd?.config?.name) return false;

      const name = cmd.config.name.toLowerCase();

      // remove old aliases if reload
      commands.forEach((value, key) => {
        if (value === cmd) commands.delete(key);
      });

      commands.set(name, cmd);

      if (Array.isArray(cmd.config.aliases)) {
        cmd.config.aliases.forEach(a => {
          commands.set(a.toLowerCase(), cmd);
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

        clearCache(filePath);
        const cmd = require(filePath);

        if (!register(cmd)) {
          fs.unlinkSync(filePath);
          return message.reply("❌ Invalid command");
        }

        return message.reply(`✅ Installed ${cmd.config.name}`);
      }

      // ================= LOAD ALL =================
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

        return message.reply(`✅ Loaded: ${ok}\n❌ Failed: ${fail}`);
      }

      // ================= UNLOAD =================
      if (subcmd === "unload") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd unload <name>");

        const cmd = commands.get(name);
        if (!cmd) return message.reply("❌ Not found");

        const realName = cmd.config.name.toLowerCase();

        commands.delete(realName);
        (cmd.config.aliases || []).forEach(a => commands.delete(a));

        return message.reply(`✅ Unloaded ${realName}`);
      }

      // ================= LOAD =================
      if (subcmd === "load") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd load <name>");

        const filePath = path.join(cmdFolder, name + ".js");

        clearCache(filePath);
        const cmd = require(filePath);

        if (!register(cmd))
          return message.reply("❌ Invalid command");

        return message.reply(`✅ Loaded ${name}`);
      }

      // ================= RELOAD =================
      if (subcmd === "reload") {
        const name = args[1]?.toLowerCase();
        if (!name) return message.reply("⚠️ cmd reload <name>");

        const filePath = path.join(cmdFolder, name + ".js");

        clearCache(filePath);
        const cmd = require(filePath);

        if (!register(cmd))
          return message.reply("❌ Invalid command");

        return message.reply(`🔄 Reloaded ${name}`);
      }

      return message.reply("❌ Invalid subcommand");

    } catch (err) {
      console.error("CMD ERROR:", err);
      return message.reply("❌ Error: " + err.message);
    }
  }
};
