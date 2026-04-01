module.exports = {
  config: {
    name: "groupinfo",
    aliases: ["grpinfo"],
    version: "2.1.0",
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

      let memberCount = "Unknown";
      try {
        memberCount = await bot.getChatMemberCount(chatId);
      } catch {
        memberCount = "N/A";
      }

      let admins = [];
      try {
        admins = await bot.getChatAdministrators(chatId);
      } catch {
        admins = [];
      }

      const escape = (text = "") =>
        text.toString().replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");

      const adminList = admins.length
        ? admins.map(a => {
            const name = a.user.username
              ? `@${escape(a.user.username)}`
              : escape(a.user.first_name);
            return `┃ 👤 ${name}`;
          }).join("\n")
        : "┃ ❌ No admin data";

      let text = `
╭━━━〔 👥 GROUP INFO 〕━━━╮
┃ 🏷️ Name   : ${escape(chat.title || "Unknown")}
┃ 🆔 ID     : \`${chatId}\`
┃ 👥 Members: ${memberCount}
┣━━━━━━━━━━━━━━━━━━━
┃ 👑 Admins:
${adminList}
╰━━━━━━━━━━━━━━━━━━━╯
`;

      if (chat.photo?.big_file_id) {
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
      console.log("❌ FULL ERROR:", err);
      message.reply("❌ | Bot needs admin permission or API failed");
    }
  }
};
