module.exports = {
  config: {
    name: "start",
    aliases: [],
    description: "Displays start menu",
    version: "3.1.0",
    author: "SK-SIDDIK-KHAN",
    category: "general",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg }) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";

    const prefix = global.config?.prefix || "/";

    const text = `
╭━━━〔 ✨ 𝗦𝗜𝗗𝗗𝗜𝗞 𝗕𝗢𝗧 ✨ 〕━━━╮
┃ 👋 Hello ${firstName} ${lastName}
┃
┃ 🤖 Welcome to *SIDDIK BOT*
┃ 💡 Your smart assistant
┣━━━━━━━━━━━━━━━━━━━
┃ ⚙️ Prefix : ${prefix}
┃ 📌 Use : ${prefix}help
┣━━━━━━━━━━━━━━━━━━━
┃ 💎 Premium Experience Active
┃ 🚀 Fast • Smart • Responsive
┣━━━━━━━━━━━━━━━━━━━
┃ 👑 Owner : SK SIDDIK KHAN
╰━━━━━━━━━━━━━━━━━━━╯
`;

    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📖 Commands", url: "https://t.me/busy1here" }
            ],
            [
              { text: "🔗 Bot Owner", url: "https://t.me/busy1here" }
            ]
          ]
        }
      });
    } catch (err) {
      console.log("❌ start error:", err);
    }
  }
};
