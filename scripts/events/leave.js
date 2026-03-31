module.exports = {
  run: async ({ bot, event }) => {

    if (event.left_chat_member) {
      const leftMember = event.left_chat_member.first_name;
      const chatName = event.chat.title || 'this group';

      const leaveMessage = `╭━━━━━━━━━━━━━━━━━━━━━━╮
${leftMember}
╰━━━━━━━━━━━━━━━━━━━━━━╯ has left from our ${chatName}.`;

      bot.sendMessage(event.chat.id, leaveMessage);
    }

  }
};
