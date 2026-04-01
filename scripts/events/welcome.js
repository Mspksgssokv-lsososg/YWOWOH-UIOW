module.exports = {
  config: {
    name: "welcome",
    version: "1.0",
    author: "SK-SIDDIK-KHAN"
  },

  onChat: async ({ bot, event }) => {
    if (event.new_chat_members) {

      const names = event.new_chat_members
        .map(u => u.first_name)
        .join(", ");

      const group = event.chat.title || "Group";

      bot.sendMessage(event.chat.id,
`╭━━━〔 😎 SIDDIK BOT 〕━━━╮
┃ 👋 Welcome ${names}
┃ 🏡 Group: ${group}
╰━━━━━━━━━━━━━━━╯`
      );
    }
  }
};
