const axios = require("axios");
const nayan = require("nayan-media-downloaders");

module.exports = {
  config: {
    name: "song",
    aliases: ["a"],
    version: "1.0.0",
    author: "SK-SIDDIK-KHAN",
    category: "media",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const query = args.join(" ");

    if (!query) {
      return bot.sendMessage(chatId, "❌ | Give song name");
    }

    try {
      const wait = await bot.sendMessage(chatId, "⏳ Searching...");

      // direct search + download
      const data = await nayan.ytdown(query);
      const audio = data.data.audio;
      const title = data.data.title;

      await bot.deleteMessage(chatId, wait.message_id);

      await bot.sendAudio(chatId, audio, {
        caption: `🎧 ${title}`
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ | Song not found");
    }
  }
};
