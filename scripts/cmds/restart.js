const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "caches");
const restartTxt = path.join(cacheDir, "restart.txt");

module.exports = {
  config: {
    name: "restart",
    aliases: [],
    version: "1.1.0",
    role: 3,
    author: "dipto",
    description: "Restart the bot.",
    usePrefix: true,
    guide: "",
    category: "admin",
    cooldown: 5
  },

  // ================= ON LOAD =================
  onLoad: async function ({ bot }) {
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      if (fs.existsSync(restartTxt)) {
        const raw = fs.readFileSync(restartTxt, "utf-8").trim();

        if (raw) {
          const [chatId, oldTime] = raw.split(" ");
          const elapsed = ((Date.now() - Number(oldTime)) / 1000).toFixed(2);

          await bot.sendMessage(chatId, `✅ | Bot restarted\n⏰ | Time: ${elapsed}s`);
        }

        fs.unlinkSync(restartTxt);
      }
    } catch (err) {
      console.error("RESTART LOAD ERROR:", err);
    }
  },

  // ================= COMMAND =================
  onStart: async function ({ message, event }) {
    try {
      const chatId = event.chat.id;

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(restartTxt, `${chatId} ${Date.now()}`);

      await message.reply("🔄 | Restarting the bot...");
      process.exit(0);

    } catch (err) {
      console.error("RESTART CMD ERROR:", err);
      return message.reply("❌ | Restart failed");
    }
  }
};
