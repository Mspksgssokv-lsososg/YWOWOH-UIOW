const fs = require("fs").promises;
const path = require("path");

module.exports = {
  config: {
    name: "clear",
    aliases: ["cache", "cleanup"],
    author: " SK-SIDDIK-KHAN",
    category: "utility",
    role: 2,
    usePrefix: true,
    cooldown: 5
  },

  onStart: async ({ bot, msg, args }) => {
    const type = args[0]?.toLowerCase() || "cache";

    let dirPath;
    if (type === "cache") {
      dirPath = path.join(process.cwd(), "cache");
    } else if (type === "temp") {
      dirPath = path.join(process.cwd(), "temp");
    } else {
      return bot.sendMessage(msg.chat.id, "❌ | Use: clear cache / clear temp", {
        reply_to_message_id: msg.message_id
      });
    }

    try {
      await fs.mkdir(dirPath, { recursive: true });

      const files = await fs.readdir(dirPath);
      const list = files.filter(f => f !== ".gitkeep");

      if (!list.length) {
        return bot.sendMessage(msg.chat.id, `🗑️ | No ${type} files`, {
          reply_to_message_id: msg.message_id
        });
      }

      let count = 0;
      for (const file of list) {
        await fs.unlink(path.join(dirPath, file));
        count++;
      }

      return bot.sendMessage(
        msg.chat.id,
        `✅ | Deleted ${count} ${type} file(s)`,
        { reply_to_message_id: msg.message_id }
      );

    } catch (err) {
      console.error(err);
      return bot.sendMessage(msg.chat.id, "❌ | Clear failed", {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
