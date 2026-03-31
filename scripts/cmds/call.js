const { adminBot = [] } = global.functions.config || {};

module.exports = {
  config: {
    name: "call",
    aliases: ["report"],
    version: "1.0.0",
    role: 0,
    author: "dipto",
    description: "Send report to admin",
    usePrefix: true,
    category: "Report",
    countDown: 5,
  },

  // ================= COMMAND RUN =================
  run: async ({ bot, message, args, event }) => {
    try {
      const userId = event.from.id;
      const text = args.join(" ").trim();

      if (!text) {
        return message.reply("❌ | Example:\n!call hello admin");
      }

      for (const adminId of adminBot) {
        const sent = await bot.sendMessage(
          adminId,
          `📩 Report from user (${userId}):\n${text}\n\nReply to this message to respond.`
        );

        global.functions.reply.set(sent.message_id, {
          commandName: "call",
          author: userId,
          target: event.chat.id
        });
      }

      message.reply("✅ | Report sent to admins");

    } catch (err) {
      console.error(err);
      message.reply("❌ | Failed to send report");
    }
  },

  // ================= REPLY SYSTEM =================
  reply: async ({ bot, message, event, Reply }) => {
    try {
      const text = event.text;
      if (!text) return;

      const { author, target } = Reply;

      // Admin → User
      if (adminBot.includes(event.from.id)) {
        await bot.sendMessage(
          target,
          `📩 Reply from admin:\n${text}`
        );
        return message.reply("✅ | Sent to user");
      }

      // User → Admin
      for (const adminId of adminBot) {
        await bot.sendMessage(
          adminId,
          `📩 Reply from user:\n${text}`
        );
      }

      message.reply("✅ | Sent to admin");

    } catch (err) {
      console.error(err);
      message.reply("❌ | Reply failed");
    }
  }
};
