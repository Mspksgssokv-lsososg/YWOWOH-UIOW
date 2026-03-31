const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "Siddik");
const restartTxt = path.join(cacheDir, "restart.txt");

module.exports.config = {
  name: "restart",
  aliases: ["rs"],
  version: "2.0.0",
  role: 3,
  author: "dipto + fixed",
  description: "Restart the bot.",
  usePrefix: true,
  category: "Admin",
  cooldown: 5
};

// 🔄 BOT START হলে
module.exports.onLoad = async ({ bot }) => {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    if (fs.existsSync(restartTxt)) {
      const data = fs.readFileSync(restartTxt, "utf-8").split(" ");
      const chatId = data[0];
      const oldtime = data[1];

      const elapsed = ((Date.now() - Number(oldtime)) / 1000).toFixed(2);

      await bot.sendMessage(chatId, `✅ | Bot restarted\n⏱️ | Time: ${elapsed}s`);

      fs.unlinkSync(restartTxt);
    }
  } catch (err) {
    console.error("❌ Restart onLoad error:", err);
  }
};

// ▶️ COMMAND
module.exports.onStart = async ({ message, event }) => {
  try {
    const chatId = event.chat.id;

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // 💾 Save restart info
    fs.writeFileSync(restartTxt, `${chatId} ${Date.now()}`);

    await message.reply("🔄 | Restarting the bot...");

    // ⏳ delay না দিলে message send হবার আগেই off হয়ে যায়
    setTimeout(() => {
      console.log("♻️ BOT RESTARTING...");
      process.exit(1); // GitHub loop থাকলে auto restart হবে
    }, 1500);

  } catch (error) {
    console.error("❌ Restart command error:", error);
    message.reply("❌ | Error occurred while restarting");
  }
};
