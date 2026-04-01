module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["boxinfo"],
    version: "2.0.0",
    author: "SK-SIDDIK-KHAN",
    description: "Get group information",
    category: "group",
    role: 0,
    usePrefix: true
  },

  run: async ({ bot, msg, message }) => {
    const chatId = msg.chat.id;

    if (msg.chat.type === "private") {
      return message.reply("❌ | This command only works in groups");
    }

    try {
      const chat = await bot.getChat(chatId);
      const memberCount = await bot.getChatMemberCount(chatId);
      const admins = await bot.getChatAdministrators(chatId);

      const escape = (text = "") =>
        text.toString().replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");

      const adminList = admins
        .map(a => {
          const name = a.user.username
            ? `@${escape(a.user.username)}`
            : escape(a.user.first_name);
          return `┃ 👤 ${name}`;
        })
        .join("\n");

      let text = `
╭━━━〔 👥 GROUP INFO 〕━━━╮
┃ 🏷️ Name   : ${escape(chat.title)}
┃ 🆔 ID     : \`${chatId}\`
┃ 👥 Members: ${memberCount}
┣━━━━━━━━━━━━━━━━━━━
┃ 👑 Admins:
${adminList}
╰━━━━━━━━━━━━━━━━━━━╯
`;

      if (chat.photo) {
        await bot.sendPhoto(chatId, chat.photo.big_file_id, {
          caption: text,
          parse_mode: "MarkdownV2"
        });
      } else {
        await bot.sendMessage(chatId, text, {
          parse_mode: "MarkdownV2"
        });
      }

    } catch (err) {
      console.log("❌ groupinfo error:", err);
      message.reply("❌ | Failed to get group info");
    }
  }
};
