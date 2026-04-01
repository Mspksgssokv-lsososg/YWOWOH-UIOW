const startTime = Date.now();

module.exports = {
  config: {
    name: "runtimes",
    aliases: ["runtime"],
    version: "2.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Check bot uptime",
    category: "system",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg }) => {
    const chatId = msg.chat.id;

    const now = Date.now();
    const diff = now - startTime;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const text = `
╭━━━〔 ⚙️ 𝗨𝗣𝗧𝗜𝗠𝗘 〕━━━╮
┃ ⏳ Active Time
┣━━━━━━━━━━━━━━━━━━
┃ 📅 ${days} Day(s)
┃ ⏰ ${hours % 24} Hour(s)
┃ ⏱️ ${minutes % 60} Minute(s)
┃ ⌛ ${seconds % 60} Second(s)
┣━━━━━━━━━━━━━━━━━━
┃ 🤖 Status: Online ✅
╰━━━━━━━━━━━━━━━━━━╯
`;

    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👑 Bot Owner",
                url: "https://t.me/busy1here"
              }
            ]
          ]
        }
      });
    } catch (err) {
      console.log("❌ uptime error:", err);
    }
  }
};
