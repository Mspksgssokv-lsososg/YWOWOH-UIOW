module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo"],
    version: "3.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Get group information",
    category: "group",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, message }) => {
    const chatId = msg.chat.id;

    if (msg.chat.type === "private") {
      return message.reply("❌ | Only works in groups");
    }

    try {
      const chat = await bot.getChat(chatId);

      const escape = (t = "") =>
        t.toString().replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");

      let text = `
╭━━━〔 👥 GROUP INFO 〕━━━╮
┃ 🏷️ Name   : ${escape(chat.title || "Unknown")}
┃ 🆔 ID     : \`${chatId}\`
┃ 📌 Type   : ${chat.type}
┃ 🔗 Username: ${chat.username ? "@" + chat.username : "Private"}
╰━━━━━━━━━━━━━━━━━━━╯
`;

      await bot.sendMessage(chatId, text, {
        parse_mode: "MarkdownV2"
      });

    } catch (err) {
      console.log("❌ REAL ERROR:", err.message);
      message.reply("❌ | API blocked / bot limited");
    }
  }
};
