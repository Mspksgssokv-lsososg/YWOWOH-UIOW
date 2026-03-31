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

  // 🔥 AUTO TRIGGER (main fix)
  onMessage: async ({ bot, chatId, message, messageId }) => {
    try {
      const text = message?.text;

      // 👉 Only run if message contains link
      if (!text || !text.includes("http")) return;

      const linkMatch = text.match(/https?:\/\/[^\s]+/);
      if (!linkMatch) return;

      const link = linkMatch[0];

      // 🔥 LOADING MSG
      const waitMsg = await bot.sendMessage(
        chatId,
        "⏳ 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚...\n━━━━━━━━━━━━━━━",
        { reply_to_message_id: messageId }
      );

      // 🔥 DOWNLOAD API
      const res = await alldown(link);

      if (!res || !res.data) {
        throw new Error("Invalid API response");
      }

      const data = res.data;
      const videoUrl = data.high || data.low || data.url;

      if (!videoUrl) {
        throw new Error("No video found");
      }

      const title = data.title || "No Title";

      // 🔥 STREAM VIDEO (no file save = fast)
      const vid = await axios.get(videoUrl, {
        responseType: "stream",
        timeout: 60000,
      });

      // 🔥 BUTTON
      const replyMarkup = {
        inline_keyboard: [
          [{ text: "📞 CONTACT ADMIN", url: "https://t.me/busy1here" }],
        ],
      };

      const caption = `
╭━━━〔 🎬 MEDIA DOWNLOADER 〕━━━╮
┃ 🎬 Title : ${title}
┃ ⚡ Status : ✅ Completed
╰━━━〔 🤖 SIDDIK BOT 〕━━━╯`;

      // 🔥 DELETE LOADING
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

      // 🔥 SEND VIDEO
      await bot.sendVideo(chatId, vid.data, {
        caption,
        reply_to_message_id: messageId,
        reply_markup: replyMarkup,
      });

    } catch (err) {
      console.error("AutoDownload Error:", err);

      bot.sendMessage(
        chatId,
        `❌ Download Failed\n${err.message || ""}`
      );
    }
  },
};
