module.exports = {
  name: "botJoin",
  author: " SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {

    if (!event.new_chat_members) return;

    const me = await bot.getMe();

    const isBotJoined = event.new_chat_members.some(
      member => member.id === me.id
    );

    if (!isBotJoined) return;

    const infoMessage = `╭━━━━━━〔 🤖 ${me.first_name} 〕━━━━━━╮
┃ Hello, dear! 👋
┃ I'm @${me.username}
┃ Ready to assist you 😎
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

    bot.sendMessage(event.chat.id, infoMessage);
  }
};
