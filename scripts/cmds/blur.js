const fs = require("fs-extra");
const axios = require("axios");
const Jimp = require("jimp");
const path = require("path");

module.exports = {
  config: {
    name: "blur",
    version: "2.1",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "image",
    guide: "/blur (reply optional)"
  },

  onStart: async ({ bot, event }) => {
    const chatId = event.chat?.id;
    if (!chatId) return;

    try {
      // 🔥 user detect
      let userId = event.from.id;

      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
      }

      console.log("USER ID:", userId);

      // 🔥 get profile photos
      const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      console.log("PHOTOS:", photos.total_count);

      if (!photos || photos.total_count === 0) {
        return bot.sendMessage(chatId, "❌ User has no profile photo!");
      }

      const fileId = photos.photos[0][0].file_id;

      // 🔥 get file info
      const file = await bot.getFile(fileId);

      if (!file.file_path) {
        return bot.sendMessage(chatId, "❌ File path not found!");
      }

      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      console.log("FILE URL:", fileUrl);

      // 🔥 download image
      const filePath = path.join(__dirname, "cache_blur.jpg");

      const res = await axios.get(fileUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, res.data);

      // 🔥 blur image
      const image = await Jimp.read(filePath);
      image.blur(5);
      await image.writeAsync(filePath);

      // 🔥 send photo
      await bot.sendPhoto(chatId, filePath, {
        caption: "🌀 Blurred Profile Pic"
      });

      // 🔥 cleanup
      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("❌ FULL ERROR:", err);

      bot.sendMessage(chatId, "❌ Error:\n" + err.message);
    }
  }
};
