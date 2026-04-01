const axios = require("axios");
const Youtube = require("youtube-search-api");

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play"],
    version: "6.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Download song with button",
    category: "media",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const keyword = args.join(" ");

    if (!keyword) {
      return bot.sendMessage(chatId,
        "⚠️ | Example: /song Believer",
        { reply_to_message_id: msg.message_id }
      );
    }

    try {
      const res = await Youtube.GetListByKeyword(keyword, false, 5);
      const list = res.items;

      if (!list.length) {
        return bot.sendMessage(chatId, "❌ | Song not found");
      }

      let text = `🎧 𝗦𝗢𝗡𝗚 𝗟𝗜𝗦𝗧\n\n`;
      const buttons = [];

      list.forEach((item, i) => {
        text += `➤ ${i + 1}. ${item.title}\n⏱ ${item.length.simpleText}\n\n`;

        buttons.push([{
          text: `${i + 1}`,
          callback_data: `song_${i}`
        }]);
      });

      const sent = await bot.sendMessage(chatId, text, {
        reply_markup: { inline_keyboard: buttons },
        reply_to_message_id: msg.message_id
      });

      global.client.handleButton.push({
        name: this.config.name,
        messageID: sent.message_id,
        author: msg.from.id,
        videos: list
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ | Search error");
    }
  },

  handleButton: async ({ bot, query, handleButton }) => {
    try {
      const userId = query.from.id;

      if (userId !== handleButton.author) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ | Not your request",
          show_alert: true
        });
      }

      await bot.answerCallbackQuery(query.id);

      const index = parseInt(query.data.split("_")[1]);
      const video = handleButton.videos[index];

      if (!video) return;

      const chatId = query.message.chat.id;

      const wait = await bot.sendMessage(chatId, "⏳ | Downloading audio...");

      // 🔥 WORKING API (stable)
      const api = `https://api.vevioz.com/api/button/mp3/${video.id}`;

      // 🎧 direct send (no file save)
      await bot.sendAudio(chatId, api, {
        caption: `🎧 ${video.title}`
      });

      await bot.deleteMessage(chatId, wait.message_id);

    } catch (err) {
      console.log(err);
      bot.sendMessage(query.message.chat.id, "❌ | Download failed");
    }
  }
};
