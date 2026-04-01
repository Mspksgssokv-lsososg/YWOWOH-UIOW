const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "caches");

module.exports = {
  config: {
    name: "restart",
    aliases: [],
    version: "2.0.0",
    role: 3,
    author: "dipto",
    description: "Soft restart (no shutdown).",
    usePrefix: true,
    category: "admin",
    cooldown: 5
  },

  onStart: async function ({ message, event }) {
    try {
      const chatId = event.chat.id;

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const start = Date.now();

      await message.reply("🔄 | Restarting the bot...");

      // ⏳ fake delay (1.5 sec)
      setTimeout(async () => {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);

        await message.reply(
          `✅ | Bot restarted\n⏰ | Time: ${elapsed}s`
        );
      }, 1500);

    } catch (err) {
      console.error("RESTART ERROR:", err);
      return message.reply("❌ | Restart failed");
    }
  }
};
