module.exports = {
  name: "leave",
  author: "SK-SIDDIK-KHAN",
  event: "message",

  run: async ({ bot, event }) => {

    if (!event.left_chat_member) return;

    const leftMember = event.left_chat_member.first_name;
    const chatName = event.chat.title || "this group";

    const leaveMessage = `╭━〔 💔 GOODBYE 〕━╮
┃ 😢 ${leftMember}
┃ 📤 Left from ${chatName}
╰━━━━━━━━━━━━╯`;

    bot.sendMessage(event.chat.id, leaveMessage);
  }
};
