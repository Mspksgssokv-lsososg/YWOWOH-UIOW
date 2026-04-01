module.exports = {
  config: {
    name: "start",
    aliases: [],
    description: "Displays the premium start menu",
    version: "2.0.0",
    author: "SK-SIDDIK-KHAN",
    category: "general",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, message }) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    const prefix = global.config?.prefix || "/";

    const text = `
╭━━━〔 ✨ 𝗦𝗧𝗔𝗥𝗧 𝗠𝗘𝗡𝗨 ✨ 〕━━━╮
┃ 👋 Hello ${firstName} ${lastName}
┃
┃ 🤖 Welcome to *SIDDIK BOT*
┣━━━━━━━━━━━━━━━━━━━
┃ 📌 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦
┃ 🔒 Lock System  → ${prefix}lock
┃ 🤖 Gemini AI    → ${prefix}gemini
┃ 🖼 Image AI     → ${prefix}img
┃ 💬 Chat GPT     → ${prefix}ai
┃ ⚙️ All Command  → ${prefix}help
┣━━━━━━━━━━━━━━━━━━━
┃ 🚀 𝗧𝗜𝗣𝗦
┃ • Use ${prefix}help to explore
┃ • Reply image with ${prefix}img
┃ • Try AI chat anytime
┣━━━━━━━━━━━━━━━━━━━
┃ 💎 Premium System Active
╰━━━━━━━━━━━━━━━━━━━╯
`;

    try {
      await bot.sendMessage(chatId, text, {
        parse_mode: "Markdown"
      });
    } catch (err) {
      console.log("❌ start error:", err);
      message.reply("❌ | Failed to send start menu");
    }
  }
};
