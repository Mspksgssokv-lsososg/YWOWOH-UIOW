module.exports = {
  config: {
    name: "notify",
    aliases: ["broadcast"],
    version: "1.0",
    author: "dipto",
    role: 3,
    description: "Send message to all groups",
    commandCategory: "admin",
    guide: "/notify <message>",
  },

  run: async function ({ message, args, msg, bot }) {
    const text = args.join(" ");
    if (!text) {
      return message.reply("❌ Please provide a message");
    }

    // 🔐 admin check (optional)
    const ADMIN_IDS = [msg.from.id]; // চাইলে static ID বসাও
    if (!ADMIN_IDS.includes(msg.from.id)) {
      return message.reply("⛔ You are not allowed to use this command");
    }

    let success = 0;
    let failed = 0;

    for (const chatId of global.chatIDs) {
      try {
        await bot.sendMessage(chatId, text);
        success++;
      } catch (e) {
        failed++;
      }
    }

    message.reply(
      `✅ Notify done\n\n📨 Sent: ${success}\n❌ Failed: ${failed}`
    );
  },
};
