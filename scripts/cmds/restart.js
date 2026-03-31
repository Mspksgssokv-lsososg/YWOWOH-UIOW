const fs = require('fs');
const path = require('path');
 
const cacheDir = path.join(__dirname, 'Siddik');
const restartTxt = path.join(cacheDir, 'restart.txt');
 
module.exports.config = {
  name: "restart",
  aliases: [],
  version: "1.0.0",
  role: 3,
  author: "dipto",
  description: "Restart the bot.",
  usePrefix: true,
  guide: "",
  category: "Admin",
  countDown: 5,
};
 
// Bot on load
module.exports.onLoad = async ({ bot }) => {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
 
    if (fs.existsSync(restartTxt)) {
      const [chatId, oldtime] = fs.readFileSync(restartTxt, "utf-8").split(" ");
      const elapsed = ((Date.now() - Number(oldtime)) / 1000).toFixed(3);
      await bot.sendMessage(chatId, `✅ | Bot restarted\n⏰ | Time: ${elapsed}s`);
      fs.unlinkSync(restartTxt);
    }
  } catch (err) {
    console.error("Error in restart onLoad:", err);
  }
};
 
// Restart command
module.exports.onStart = async ({ message, chatId }) => {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
 
    // Save restart data (chatId instead of threadID)
    fs.writeFileSync(restartTxt, `${chatId} ${Date.now()}`);
 
    await message.reply("🔄 | Restarting the bot...");
    process.exit(0); // 0 is normal exit code
  } catch (error) {
    console.error("Restart command error:", error);
    message.reply("❌ | Error occurred while restarting");
  }
};
 
