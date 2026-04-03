module.exports = {
  config: {
    name: "allgroup",
    aliases: ["allgc", "groups"],
    version: "2.2",
    author: "Siddik",
    description: "Show groups and leave by reply",
    category: "admin"
  },

  onStart: async ({ bot, message, msg, threadsData }) => {
    try {
      const config = global.config;

      // ✅ FIX HERE
      const userId = msg.from.id;

      if (!(config.admins || []).includes(userId)) {
        return message.reply("❌ | You are not admin");
      }

      const allThreads = await threadsData.getAll();

      if (!allThreads || allThreads.length === 0) {
        return message.reply("❌ | No groups found");
      }

      let text = `📊 | Total Groups: ${allThreads.length}\n\n`;

      for (let i = 0; i < allThreads.length; i++) {
        const threadId = allThreads[i].threadId;

        let name = "Unknown";

        try {
          const chat = await bot.getChat(threadId);
          name = chat.title || "No Name";
        } catch {}

        text += `${i + 1}. ${name}\n`;
      }

      text += `\n👉 Reply with number to leave group`;

      const sent = await message.reply(text);

      global.onReply.set(sent.message_id, {
        commandName: "allgroup",
        author: userId,
        threads: allThreads
      });

    } catch (err) {
      console.log("ALLGROUP ERROR:", err);
      return message.reply("❌ " + err.message);
    }
  },

  onReply: async ({ bot, message, msg, Reply }) => {
    try {
      const userId = msg.from.id;

      if (userId !== Reply.author) return;

      const choice = parseInt(msg.text);

      if (isNaN(choice)) {
        return message.reply("❌ | Send valid number");
      }

      const thread = Reply.threads[choice - 1];

      if (!thread) {
        return message.reply("❌ | Not found");
      }

      const threadId = thread.threadId;

      try {
        await bot.leaveChat(threadId);
        return message.reply(`✅ Left group:\n🆔 ${threadId}`);
      } catch (e) {
        return message.reply("❌ Failed to leave group");
      }

    } catch (err) {
      console.log("REPLY ERROR:", err);
      return message.reply("❌ " + err.message);
    }
  }
};
