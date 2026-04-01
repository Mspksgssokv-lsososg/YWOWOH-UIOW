const fs = require("fs");
const path = require("path");
const axios = require("axios");
const nayan = require("nayan-media-downloaders");
const Youtube = require("youtube-search-api");

module.exports = {
  config: {
    name: "song",
    aliases: ["a"],
    version: "3.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Search and download songs",
    category: "media",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const keyword = args.join(" ");

    if (!keyword) {
      return bot.sendMessage(chatId,
        "⚠️ Please provide a keyword\nExample: /song Believer",
        { reply_to_message_id: msg.message_id }
      );
    }

    try {
      const results = await Youtube.GetListByKeyword(keyword, false, 6);
      const list = results.items;

      if (!list || !list.length) {
        return bot.sendMessage(chatId, "❌ No results found");
      }

      // 🔘 buttons
      const buttons = list.map((item, i) => ([
        {
          text: `${i + 1}. ${item.title.substring(0, 30)}`,
          callback_data: `song_${i}`
        }
      ]));

      const text =
        `🎵 *Search Results for:* ${keyword}\n\n` +
        list.map((item, i) =>
          `*${i + 1}. ${item.title}*\n⏱ ${item.length.simpleText}`
        ).join("\n\n");

      const sent = await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons },
        reply_to_message_id: msg.message_id
      });

      // ✅ save button handler
      global.client.handleButton.push({
        name: this.config.name,
        messageID: sent.message_id,
        author: msg.from.id,
        links: list.map(v => v.id)
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ Search failed");
    }
  },

  handleButton: async ({ bot, query, handleButton }) => {
    const chatId = query.message.chat.id;

    try {
      // 🔒 only requester can click
      if (query.from.id !== handleButton.author) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ Not your request",
          show_alert: true
        });
      }

      const index = parseInt(query.data.split("_")[1]);
      const videoId = handleButton.links[index];

      if (!videoId) return;

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      await bot.answerCallbackQuery(query.id);

      const waitMsg = await bot.sendMessage(chatId, "⏳ Fetching audio...");

      const data = await nayan.ytdown(videoUrl);
      const audioUrl = data.data.audio;
      const title = data.data.title;

      // 📁 cache folder
      const dir = path.join(__dirname, "cache");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const filePath = path.join(dir, `song_${Date.now()}.mp3`);
      const writer = fs.createWriteStream(filePath);

      const res = await axios.get(audioUrl, { responseType: "stream" });
      res.data.pipe(writer);

      writer.on("finish", async () => {
        await bot.deleteMessage(chatId, waitMsg.message_id);

        await bot.sendAudio(chatId, filePath, {
          caption: `🎧 *${title}*`,
          parse_mode: "Markdown"
        });

        fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "❌ Failed to download");
    }
  }
};
