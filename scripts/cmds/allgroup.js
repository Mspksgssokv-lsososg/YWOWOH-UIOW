module.exports = {
  config: {
    name: "allgroup",
    aliases: ["list"],
    version: "4.0",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    usePrefix: false,
    role: 2,
    category: "owner",
  },

  // 🔥 runtime memory (global)
  onLoad: () => {
    if (!global.groupStore) {
      global.groupStore = new Set();
    }
  },

  onStart: async ({ bot, message }) => {
    try {
      const groups = Array.from(global.groupStore || []);

      if (!groups.length) {
        return message.reply("⚠️ | No Groups Found");
      }

      let msg =
        `♡   ∩_∩\n` +
        ` （„• ֊ •„)♡\n` +
        `╭─∪∪────────────⟡\n` +
        `│ 𝗔𝗟𝗟 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧\n` +
        `├───────────────⟡\n`;

      let map = [];

      for (let i = 0; i < groups.length; i++) {
        const chatId = groups[i];
        let name = "Unknown";

        try {
          const chat = await bot.getChat(chatId);
          name = chat.title || "No Name";
        } catch {}

        msg +=
          `│ ${i + 1}. ${name}\n` +
          `│ 🆔 ${chatId}\n│\n`;

        map.push({
          index: i + 1,
          chatId
        });
      }

      msg +=
        `╰───────────────⟡\n` +
        `💬 Reply with number to leave group`;

      const sent = await message.reply(msg);

      global.functions.reply.set(sent.message_id, {
        commandName: "allgroup",
        groups: map
      });

    } catch (e) {
      console.log("ALLGROUP ERROR:", e);
      message.reply("❌ Error Fetching Groups");
    }
  },

  onReply: async ({ bot, event, message, Reply }) => {
    try {
      const num = parseInt(event.text);

      if (isNaN(num)) {
        return message.reply("❌ Invalid Number");
      }

      const group = Reply.groups.find(g => g.index === num);

      if (!group) {
        return message.reply("❌ Group Not Found");
      }

      await bot.leaveChat(group.chatId);

      // remove from memory
      global.groupStore.delete(group.chatId);

      message.reply(`✅ Left Group\n🆔 ${group.chatId}`);

    } catch (e) {
      console.log("REPLY ERROR:", e);
      message.reply("❌ Failed To Leave");
    }
  }
};
