const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "setphoto",
    author: " SK-SIDDIK-KHAN",
    aliases: ["gcimg"],
    category: "admin",
    role: 2,
    cooldown: 5
  },

  onStart: async function ({ msg, bot }) {
    const chatId = msg.chat.id;

    if (!msg.reply_to_message?.photo) {
      return bot.sendMessage(chatId, "❌ | Reply to a photo", {
        reply_to_message_id: msg.message_id
      });
    }

    try {
      const photo = msg.reply_to_message.photo.slice(-1)[0];
      const file = await bot.getFile(photo.file_id);

      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      const res = await axios.get(fileUrl, { responseType: "arraybuffer" });

      const filePath = path.join(__dirname, "photo.jpg");
      fs.writeFileSync(filePath, res.data);

      await bot.setChatPhoto(chatId, filePath);

      fs.unlinkSync(filePath);

      return bot.sendMessage(chatId, "✅ | Chat photo updated", {
        reply_to_message_id: msg.message_id
      });

    } catch (err) {
      console.error("SET PHOTO ERROR:", err);
      return bot.sendMessage(chatId, "❌ | Failed to set photo", {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
