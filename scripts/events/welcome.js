module.exports = {
  config: {
    name: "welcome",
    author: "SK-SIDDIK-KHAN",
    version: "1.0",
    role: 0
  },

  onChat: async ({ bot, event }) => {
    if (event.new_chat_members) {
      const names = event.new_chat_members
        .map(u => u.first_name)
        .join(", ");

      const groupName = event.chat.title || "this group";

      const msg = `𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐃𝐄𝐀𝐑:
╭───────────────╮
✨ ${names}
╰───────────────╯
📍 ${groupName}`;

      bot.sendMessage(event.chat.id, msg);
    }
  }
};
