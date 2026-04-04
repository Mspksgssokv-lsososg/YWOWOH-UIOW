const TelegramBot = require("node-telegram-bot-api");

module.exports = {
  config: {
    name: "adduser",
    author: "Samir Œ (Fixed by Siddik)",
    description: "Invite user via link",
    category: "admin",
    usage: "adduser <user_id>",
    usePrefix: true,
    role: 1
  },

  onStart: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    if (!args[0] && !msg.reply_to_message) {
      return bot.sendMessage(
        chatId,
        "❌ | Reply user or give user ID"
      );
    }

    // 🔥 user detect system
    const userId =
      msg.reply_to_message?.from.id ||
      (!isNaN(args[0]) ? parseInt(args[0]) : null);

    if (!userId) {
      return bot.sendMessage(
        chatId,
        "❌ | Invalid user ID (username not supported)"
      );
    }

    try {
      // ✅ check admin
      const me = await bot.getChatMember(chatId, senderId);
      if (!["administrator", "creator"].includes(me.status)) {
        return bot.sendMessage(
          chatId,
          "❌ | You must be admin"
        );
      }

      // ✅ create 1-time invite link
      const invite = await bot.createChatInviteLink(chatId, {
        member_limit: 1
      });

      try {
        // 🔥 try DM
        await bot.sendMessage(
          userId,
          `📩 Join Group:\n${invite.invite_link}`
        );

        return bot.sendMessage(
          chatId,
          `✅ | Invite sent to ${userId}`
        );

      } catch (dmError) {
        // ❌ fallback
        return bot.sendMessage(
          chatId,
          `⚠️ | Cannot DM user\n\n🔗 Invite Link:\n${invite.invite_link}`
        );
      }

    } catch (err) {
      console.error(err);

      return bot.sendMessage(
        chatId,
        "❌ | Bot must be admin with invite permission"
      );
    }
  }
};
