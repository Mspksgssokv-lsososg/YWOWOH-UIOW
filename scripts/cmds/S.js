module.exports = {
  config: {
    name: "allgroup",
    aliases: ["groups", "glist"],
    version: "1.0",
    author: "SK-SIDDIK-KHAN",
    role: 2, // only bot admin
    shortDescription: "Show all groups & leave",
    category: "admin"
  },

  onStart: async ({ bot, message }) => {
    try {
      const fs = require("fs");
      const path = require("path");

      const threadFile = path.join(process.cwd(), "threads.json");

      let groups = [];
      try {
        groups = JSON.parse(fs.readFileSync(threadFile));
      } catch {
        groups = [];
      }

      if (groups.length === 0) {
        return message.reply("❌ | No groups found");
      }

      let msg = "📌 | GROUP LIST:\n\n";
      let map = [];

      for (let i = 0; i < groups.length; i++) {
        const chatId = groups[i];

        try {
          const chat = await bot.getChat(chatId);
          const count = await bot.getChatMembersCount(chatId);

          msg += `${i + 1}. ${chat.title}\n👥 Members: ${count}\n🆔 ID: ${chatId}\n\n`;

          map.push({
            index: i + 1,
            chatId
          });

        } catch {
          msg += `${i + 1}. Unknown Group\n🆔 ${chatId}\n\n`;
          map.push({
            index: i + 1,
            chatId
          });
        }
      }

      msg += "👉 Reply with number to leave group";

      const sent = await message.reply(msg);

      global.functions.reply.set(sent.message_id, {
        commandName: this.config.name,
        groups: map
      });

    } catch (e) {
      console.log(e);
      message.reply("❌ Error fetching groups");
    }
  },

  onReply: async ({ bot, event, message, Reply }) => {
    try {
      const input = parseInt(event.text);

      if (isNaN(input)) {
        return message.reply("❌ | Please enter a valid number");
      }

      const selected = Reply.groups.find(g => g.index === input);

      if (!selected) {
        return message.reply("❌ | Invalid selection");
      }

      const chatId = selected.chatId;

      try {
        await bot.leaveChat(chatId);
        message.reply(`✅ | Left group:\n🆔 ${chatId}`);
      } catch (err) {
        message.reply("❌ | Failed to leave group");
      }

    } catch (e) {
      console.log(e);
      message.reply("❌ Reply error");
    }
  }
};
