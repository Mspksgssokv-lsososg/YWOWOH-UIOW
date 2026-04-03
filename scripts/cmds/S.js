const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "allgroup",
    aliases: ["groups", "glist"],
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    role: 2,
    shortDescription: "Show all groups & leave",
    category: "admin"
  },

  onStart: async ({ bot, message }) => {
    try {
      const threadFile = path.join(process.cwd(), "threads.json");

      let groups = [];
      try {
        groups = JSON.parse(fs.readFileSync(threadFile));
      } catch {
        groups = [];
      }

      if (!groups.length) {
        return message.reply("❌ | No groups found");
      }

      let msg = "📌 | GROUP LIST:\n\n";
      let map = [];
      let validGroups = [];

      for (let i = 0; i < groups.length; i++) {
        const chatId = groups[i];

        let name = "Unknown Group";
        let count = "N/A";

        try {
          const chat = await bot.getChat(chatId);
          name = chat.title || chat.username || "Private Chat";
        } catch {
          name = "Unknown Group";
        }

        try {
          count = await bot.getChatMembersCount(chatId);
        } catch {
          count = "N/A";
        }

        // ❌ skip broken group
        if (name === "Unknown Group") continue;

        msg += `${map.length + 1}. ${name}\n👥 Members: ${count}\n🆔 ID: ${chatId}\n\n`;

        map.push({
          index: map.length + 1,
          chatId
        });

        validGroups.push(chatId);
      }

      // ✅ AUTO CLEAN INVALID GROUP
      fs.writeFileSync(threadFile, JSON.stringify(validGroups, null, 2));

      if (!map.length) {
        return message.reply("❌ | No valid groups found");
      }

      msg += "👉 Reply with number to leave group";

      const sent = await message.reply(msg);

      global.functions.reply.set(sent.message_id, {
        commandName: this.config.name,
        groups: map
      });

    } catch (e) {
      console.log("ALLGROUP ERROR:", e);
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
        message.reply(`✅ | Successfully left group\n🆔 ${chatId}`);
      } catch (err) {
        console.log("LEAVE ERROR:", err);
        message.reply("❌ | Failed to leave group");
      }

    } catch (e) {
      console.log("REPLY ERROR:", e);
      message.reply("❌ Reply error");
    }
  }
};
