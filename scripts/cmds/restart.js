const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "Siddik");
const restartFile = path.join(cacheDir, "restart.txt");

module.exports.config = {
  name: "restart",
  aliases: ["rs"],
  version: "1.0.0",
  role: 3,
  author: "Siddik",
  description: "Restart the bot",
  usePrefix: true,
  cooldown: 5
};

// 🔄 Bot start হলে message দিবে
module.exports.onLoad = async ({ bot }) => {
  try {
    if (!fs.existsSync(restartFile)) return;

    const [chatId, oldTime] = fs.readFileSync(restartFile, "utf-8").split(" ");
    const time = ((Date.now() - Number(oldTime)) / 1000).toFixed(2);

    await bot.sendMessage(chatId, `✅ | Bot restarted\n⏰ | Time: ${time}s`);

    fs.unlinkSync(restartFile);
  } catch (e) {
    console.error("Restart onLoad error:", e);
  }
};

// ▶️ Command run
module.exports.onStart = async ({ message, event }) => {
  try {
    const chatId = event.chat.id;
    const start = Date.now();

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 💾 save restart info
    fs.writeFileSync(restartFile, `${chatId} ${start}`);

    await message.reply("🔄 | Restarting the bot...");

    // ⏳ delay না দিলে message send হওয়ার আগেই bot off হয়ে যাবে
    setTimeout(() => {
      console.log("♻️ BOT RESTARTING...");
      process.exit(1); // 🔥 must for restart
    }, 1500);

  } catch (err) {
    console.error("Restart error:", err);
    message.reply("❌ | Restart failed");
  }
};
