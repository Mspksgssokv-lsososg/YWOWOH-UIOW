const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "allgroup",
    aliases: ["groups"],
    role: 2
  },

  onStart: async ({ bot, message }) => {
    try {
      const threadFile = path.join(process.cwd(), "threads.json");

      let groups = JSON.parse(fs.readFileSync(threadFile));

      if (!groups.length) {
        return message.reply("❌ No groups found");
      }

      let msg = "📌 | GROUP LIST:\n\n";
      let map = [];

      for (let i = 0; i < groups.length; i++) {
        const chatId = groups[i];

        let name = "Unknown";
        let count = "N/A";

        try {
          const chat = await bot.getChat(chatId);
          name = chat.title || "No Name";
        } catch {}

        try {
          count = await bot.getChatMembersCount(chatId);
        } catch {}

        msg += `${i + 1}. ${name}\n👥 ${count}\n🆔 ${chatId}\n\n`;

        map.push({
          index: i + 1,
          chatId
        });
      }

      msg += "👉 Reply number to leave";

      const sent = await message.reply(msg);

      global.functions.reply.set(sent.message_id, {
        commandName: "allgroup", // ✅ FIXED
        groups: map
      });

    } catch (e) {
      console.log("ALLGROUP ERROR:", e);
      message.reply("❌ Error fetching groups");
    }
  },

  onReply: async ({ bot, event, message, Reply }) => {
    try {
      const num = parseInt(event.text);

      if (isNaN(num)) {
        return message.reply("❌ Invalid number");
      }

      const group = Reply.groups.find(g => g.index === num);

      if (!group) {
        return message.reply("❌ Not found");
      }

      await bot.leaveChat(group.chatId);

      message.reply(`✅ Left group:\n${group.chatId}`);

    } catch (e) {
      console.log("REPLY ERROR:", e);
      message.reply("❌ Failed");
    }
  }
};
