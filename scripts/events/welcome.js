module.exports = {
  name: "welcome",
  author: "SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {

    if (!event.new_chat_members) return;

    const me = await bot.getMe();

    const realMembers = event.new_chat_members.filter(
      u => u.id !== me.id
    );

    if (realMembers.length === 0) return;

    const names = realMembers.map(u => {
      return u.username ? `@${u.username}` : u.first_name;
    }).join(", ");

    const group = event.chat.title || "Group";

    bot.sendMessage(event.chat.id,
`╭━━〔 SIDDIK BOT 〕━━╮
┃ 👋 Welcome ${names}
┃ 🏡 ${group}
╰━━━━━━━━━━━━━━━╯`);
  }
};
