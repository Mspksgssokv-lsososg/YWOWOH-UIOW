const fs = require("fs-extra");
const axios = require("axios");
const Jimp = require("jimp");
const path = require("path");

module.exports = {
  config: {
    name: "blur",
    version: "4.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    usePrefix: false,
    category: "image",
    guide: "/blur (reply / mention)"
  },

  onStart: async ({ bot, event }) => {
    const chatId = event.chat?.id;
    if (!chatId) return;

    try {
      let userId = event.from.id;
      let userName =
        event.from.first_name ||
        event.from.username ||
        "User";

      if (event.entities) {
        const mention = event.entities.find(
          e => e.type === "text_mention"
        );
        if (mention) {
          userId = mention.user.id;
          userName =
            mention.user.first_name ||
            mention.user.username ||
            "User";
        }
      }

      if (event.reply_to_message) {
        userId = event.reply_to_message.from.id;
        userName =
          event.reply_to_message.from.first_name ||
          event.reply_to_message.from.username ||
          "User";
      }

      const mentionTag = `<a href="tg://user?id=${userId}">${userName}</a>`;

      const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });

      if (!photos || photos.total_count === 0) {
        return bot.sendMessage(chatId, "❌ User has no profile photo");
      }

      const fileId = photos.photos[0][0].file_id;
      const file = await bot.getFile(fileId);

      if (!file.file_path) {
        return bot.sendMessage(chatId, "❌ File path not found");
      }

      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      const filePath = path.join(__dirname, `blur_${Date.now()}.jpg`);

      const res = await axios.get(fileUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, res.data);

      const image = await Jimp.read(filePath);
      image.blur(1); 
      await image.writeAsync(filePath);

      await bot.sendPhoto(chatId, filePath, {
        caption: `🌀 Blurred profile of ${mentionTag}`,
        parse_mode: "HTML"
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("❌ FULL ERROR:", err);
      bot.sendMessage(chatId, "❌ Error:\n" + err.message);
    }
  }
};
