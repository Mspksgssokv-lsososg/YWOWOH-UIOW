module.exports = {
  run: async ({ bot, event }) => {

    if (event.new_chat_member && event.new_chat_member.id === bot.id) {
      const infoMessage = `Hello, DEAR !
╭━━━━━━ [ I'm ${bot.username} ] ━━━━━━╮

I'm the bot. How can I assist you today?`;

      bot.sendMessage(event.chat.id, infoMessage);
    }

  }
};
