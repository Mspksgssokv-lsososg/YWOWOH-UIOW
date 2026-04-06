const axios = require("axios");
const { alldown } = require("nayan-media-downloaders");

module.exports = {
  config: {
    name: "alldown",
    author: "SK-SIDDIK-KHAN",
    description: "Auto Video Downloader",
    category: "media",
    usePrefix: false,
  },

  onMessage: async ({ bot, chatId, message, messageId }) => {
    try {
      const text = message?.text;
      if (!text) return;

      const urlMatch = text.match(/https?:\/\/[^\s]+/i);
      if (!urlMatch) return;

      const url = urlMatch[0];

      const waitMsg = await bot.sendMessage(chatId, "Downloading video...", {
        reply_to_message_id: messageId,
      });

      const response = await alldown(url);
      const data = response?.data;

      if (!data) throw new Error("Invalid API response");

      const videoUrl = data.high || data.low || data.url;
      if (!videoUrl) throw new Error("No downloadable video found");

      const title = data.title || "Untitled";

      const videoStream = await axios.get(videoUrl, {
        responseType: "stream",
        timeout: 60000,
      });

      const caption = `╭━━〔 DOWNLOADER 〕━━╮
┃ Title: ${title}
┃ Status: Completed
╰━━━〔 SIDDIK BOT 〕━━━╯`;

      const replyMarkup = {
        inline_keyboard: [
          [{ text: "Contact Admin", url: "https://t.me/busy1here" }],
        ],
      };

      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

      await bot.sendVideo(chatId, videoStream.data, {
        caption,
        reply_to_message_id: messageId,
        reply_markup: replyMarkup,
      });

    } catch (error) {
      console.error("AutoDownload Error:", error);

      await bot.sendMessage(
        chatId,
        `Download Failed\n${error.message || "Unknown error"}`
      );
    }
  },
};
