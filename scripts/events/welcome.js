module.exports = {
  event: "message",

  run: async ({ bot, event }) => {

    if (!event.new_chat_members) return;

    const names = event.new_chat_members.map(u => u.first_name).join(", ");
    const group = event.chat.title || "Group";

    bot.sendMessage(event.chat.id,
`╭━━━〔 😎 SIDDIK BOT 〕━━━╮
┃ 👋 Welcome ${names}
┃ 🏡 ${group}
╰━━━━━━━━━━━━━━━╯`
    );
  }
};
