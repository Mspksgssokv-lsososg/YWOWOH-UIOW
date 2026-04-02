const fs = require("fs-extra");
const axios = require("axios");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "blur",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    category: "image",
    guide: "/blur (reply optional)"
  },

  onStart: async ({ bot, event }) => {
    try {
      const chatId = event.chat?.id;
      if (!chatId) return;

      // 🔥 user detect
      let userId;

      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
      } else {
        userId = event.from.id;
      }

      // 🔥 get profile pic
      const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      if (photos.total_count === 0) {
        return bot.sendMessage(chatId, "❌ No profile photo found!");
      }

      const fileId = photos.photos[0][0].file_id;

      // 🔥 get file link
      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

      // 🔥 download image
      const path = __dirname + "/Siddik/blur.jpg";
      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(path, res.data);

      // 🔥 blur using Jimp
      const image = await Jimp.read(path);
      image.blur(5);
      await image.writeAsync(path);

      // 🔥 send blurred image
      await bot.sendPhoto(chatId, path, {
        caption: "🌀 Blurred Profile Pic"
      });

      // 🔥 delete temp file
      fs.unlinkSync(path);

    } catch (err) {
      console.log("❌ blur error:", err.message);

      bot.sendMessage(
        event.chat?.id,
        "❌ Failed to blur image!"
      );
    }
  }
};
