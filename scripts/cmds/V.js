module.exports = {
  config: {
    name: "spamkick",
    version: "1.0",
    aliases: [],
    author: "Dipto",
    cooldown: 3,
    role: 1, // group admin can use
    description: "Automatically kicks spammers from the group",
    commandCategory: "moderation",
    guide: "Auto detect spam and kick user",
  },

  onChat: async function ({ bot, message, event, threadsData }) {
    try {
      const chatId = event.chat.id;
      const userId = event.from.id;

      // ❌ ignore bot নিজে
      if (event.from.is_bot) return;

      // ================= THREAD SAFE =================
      let thread = await threadsData.get(chatId);
      if (!thread) thread = {};

      if (!thread.settings) thread.settings = {};
      if (!thread.settings.spamDetection)
        thread.settings.spamDetection = {};

      const currentTime = Date.now();

      let userMessages =
        thread.settings.spamDetection[userId] || [];

      // ================= SAVE MESSAGE TIME =================
      userMessages.push(currentTime);

      // last 10 sec messages only
      const recentMessages = userMessages.filter(
        (time) => currentTime - time < 10000
      );

      thread.settings.spamDetection[userId] = recentMessages;

      // ================= SPAM DETECT =================
      if (recentMessages.length > 5) {
        try {
          console.log(`🚨 Spam detected: ${userId}`);

          await bot.banChatMember(chatId, userId);

          await message.reply(
            `⚠️ ${event.from.first_name} has been kicked for spamming!`
          );

          // reset after kick
          thread.settings.spamDetection[userId] = [];

        } catch (err) {
          console.log("❌ Kick Error:", err);

          await message.reply(
            "❌ Failed to kick user (Bot needs admin permission)"
          );
        }
      }

      await threadsData.set(chatId, thread);

    } catch (err) {
      console.log("❌ SPAMKICK ERROR:", err);
    }
  },
};
