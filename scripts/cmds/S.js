module.exports = {
  config: {
    name: "allgroup",
    aliases: ["allgc", "groups"],
    version: "2.0",
    author: "Siddik",
    description: "Show groups and leave by reply",
    category: "admin"
  },

  onStart: async ({ bot, message, threadsData }) => {
    try {
      const config = global.config;
      const userId = message.event.from.id;

      // 🔒 admin only
      if (!(config.admins || []).includes(userId)) {
        return message.reply("❌ | You are not admin");
      }

      const allThreads = await threadsData.getAll();

      if (!allThreads || allThreads.length === 0) {
        return message.reply("❌ | No groups found");
      }

      let msg = `📊 | Total Groups: ${allThreads.length}\n\n`;

      for (let i = 0; i < allThreads.length; i++) {
        const threadId = allThreads[i].threadId;

        let name = "Unknown";
        try {
          const chat = await bot.getChat(threadId);
          name = chat.title || "No Name";
        } catch {}

        msg += `${i + 1}. ${name}\n`;
      }

      msg += `\n👉 Reply with number to leave group`;

      const sent = await message.reply(msg);

      // ✅ SAVE REPLY DATA
      global.functions.onReply.set(sent.message_id, {
        commandName: this.config.name,
        author: userId,
        threads: allThreads
      });

    } catch (err) {
      console.log(err);
      return message.reply("❌ Error");
    }
  },

  onReply: async ({ bot, message, event, Reply }) => {
    try {
      const userId = event.from.id;

      // শুধু original user reply দিতে পারবে
      if (userId !== Reply.author) return;

      const choice = parseInt(event.text);
      if (isNaN(choice)) return message.reply("❌ | Invalid number");

      const thread = Reply.threads[choice - 1];
      if (!thread) return message.reply("❌ | Not found");

      const threadId = thread.threadId;

      try {
        await bot.leaveChat(threadId);
        return message.reply(`✅ Left group ID: ${threadId}`);
      } catch (e) {
        return message.reply("❌ Failed to leave group");
      }

    } catch (err) {
      console.log(err);
      return message.reply("❌ Error");
    }
  }
};
