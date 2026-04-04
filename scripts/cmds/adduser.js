module.exports = {
  config: {
    name: "adduser",
    aliases: ["add"],
    author: "SK-SIDDIK-KHAN",
    countDown: 2,
    role: 3,
    description: "Send group invite link to user",
    category: "Admin",
    usePrefix: true,
    usage: "{pn} <userID>"
  },

  onStart: async ({ bot, msg, args, message }) => {
    const chatId = msg.chat.id;

    const userId =
      msg.reply_to_message?.from.id ||
      args[0];

    if (!userId) {
      return message.reply("❌ | Provide user ID or reply user");
    }

    try {
      const inviteLink = await bot.exportChatInviteLink(chatId);

      await bot.sendMessage(
        userId,
        `📩 You are invited to join the group:\n${inviteLink}`
      );

      return message.reply(`✅ | Invite sent to ${userId}`);

    } catch (err) {
      console.error(err);
      return message.reply("❌ | Failed to send invite");
    }
  }
};
