const axios = require("axios");
const Youtube = require("youtube-search-api");

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play"],
    version: "5.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Search and download song with button",
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

      // 🎵 List Message
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
        reply_markup: {
          inline_keyboard: buttons
        },
        reply_to_message_id: msg.message_id
      });

      // 🔥 Save handler
      global.client.handleButton.push({
        name: this.config.name,
        messageID: sent.message_id,
        author: msg.from.id,
        videos: list
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ | Error fetching songs");
    }
  },

  // 🔥 BUTTON CLICK
  handleButton: async ({ bot, query, handleButton }) => {
    try {
      const userId = query.from.id;

      // ❌ Only command user can click
      if (userId !== handleButton.author) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ | Not your request",
          show_alert: true
        });
      }

      const index = parseInt(query.data.split("_")[1]);
      const video = handleButton.videos[index];

      if (!video) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ | Invalid selection",
          show_alert: true
        });
      }

      const chatId = query.message.chat.id;

      await bot.sendMessage(chatId, "⏳ | Downloading...");

      // 🔥 WORKING API
      const api = `https://yt-downloader-music.vercel.app/?url=https://www.youtube.com/watch?v=${video.id}`;

      const res = await axios.get(api);

      if (!res.data || !res.data.audio) {
        return bot.sendMessage(chatId, "❌ | Download failed");
      }

      // 🎧 Send Audio
      await bot.sendAudio(chatId, res.data.audio, {
        title: video.title
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(query.message.chat.id, "❌ | Error downloading");
    }
  }
};
