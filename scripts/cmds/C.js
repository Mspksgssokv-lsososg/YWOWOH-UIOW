module.exports = {
  config: {
    name: "sk",
    aliases: ["o", "v"],
    version: "2.1",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    description: "Add owner to group",
    category: "admin",
  },

  onStart: async function ({ bot, message }) {
    const chatId = message.chat.id;

    // ✅ OWNER
    const ownerID = 6734899387;
    const ownerName = "HEARTLESS BOY";

    try {
      // 🔍 check already in group
      try {
        const member = await bot.getChatMember(chatId, ownerID);

        if (member && member.status !== "left") {
          return bot.sendMessage(chatId, `✅ ${ownerName} already in group`, {
            entities: [
              {
                type: "text_mention",
                offset: 2,
                length: ownerName.length,
                user: { id: ownerID }
              }
            ]
          });
        }
      } catch {}

      // ➕ add owner
      await bot.addChatMember(chatId, ownerID);

      // ❤️ mention message
      return bot.sendMessage(chatId, `❤️ ${ownerName} added successfully`, {
        entities: [
          {
            type: "text_mention",
            offset: 2,
            length: ownerName.length,
            user: { id: ownerID }
          }
        ]
      });

    } catch (err) {
      console.error("CALL CMD ERROR:", err);

      return bot.sendMessage(
        chatId,
        "❌ Failed to add owner!\n\n👉 Make sure:\n- Bot is admin\n- Owner started bot\n- Privacy allows adding"
      );
    }
  },
};
