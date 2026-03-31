module.exports = {
  run: async ({ bot, event }) => {

    if (event.new_chat_members) {
      const newMembers = event.new_chat_members
        .map(member => member.first_name)
        .join(', ');

      const chatName = event.chat.title || 'this group';

      const welcomeMessage = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐃𝐄𝐀𝐑: 
╭──────────────────╮
 ✨ ${newMembers} 🍀
╰──────────────────╯ to
 ⑅⃝»̶̶͓͓͓̽̽̽»̶̶͓͓͓̽̽̽๓ ${chatName} ꕀ⃘⃜⃟ؖؖؖؖؖؖؖؖؖꙮ͌͌͌͌͌͌͌͌͌͌͌͌͌͌ꔹ⃟ꔹ⃟!`;

      bot.sendMessage(event.chat.id, welcomeMessage);
    }

  }
};
