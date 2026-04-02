const fs = require("fs-extra");
const axios = require("axios");
const Jimp = require("jimp");
const path = require("path");

module.exports = {
  config: {
    name: "blur",
    version: "3.1",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "image",
    guide: "/blur (reply optional)"
  },

  onStart: async ({ bot, event }) => {
    const chatId = event.chat?.id;
    if (!chatId) return;

    try {
      let userId = event.from.id;
      let userName = event.from.first_name || "User";

      // 👉 reply হলে ওই user
      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
        userName = event.reply_to_message.from.first_name || "User";
      }

      const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      if (!photos || photos.total_count === 0) {
        return bot.sendMessage(chatId, "❌ User has no profile photo!");
      }

      const fileId = photos.photos[0][0].file_id;
      const file = await bot.getFile(fileId);

      if (!file.file_path) {
        return bot.sendMessage(chatId, "❌ File path not found!");
      }

      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
      const filePath = path.join(__dirname, "cache_blur.jpg");

      const res = await axios.get(fileUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, res.data);

      // 🔥 Blur কম করা হয়েছে (5 → 2)
      const image = await Jimp.read(filePath);
      image.blur(2);
      await image.writeAsync(filePath);

      // 👉 mention system
      await bot.sendPhoto(chatId, filePath, {
        caption: `🌀 Blurred profile of ${userName}`,
        parse_mode: "HTML",
        reply_to_message_id: event.message_id
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("❌ FULL ERROR:", err);
      bot.sendMessage(chatId, "❌ Error:\n" + err.message);
    }
  }
};
