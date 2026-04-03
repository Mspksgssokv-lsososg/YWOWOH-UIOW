const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "allgroup",
    aliases: ["list"],
    version: "2.4",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    usePrefix: false,
    role: 2,
    category: "owner",
  },

  onStart: async ({ bot, message }) => {
    try {

      const chats = await bot.getChats();
      const groups = chats.filter(chat =>
        chat.type === "group" ||
        chat.type === "supergroup"
      );

      if (!groups.length) {
        return message.reply("⚠️ | 𝙉𝙤 𝙂𝙧𝙤𝙪𝙥𝙨 𝙁𝙤𝙪𝙣𝙙");
      }

      let msg =
        `♡   ∩_∩\n` +
        ` （„• ֊ •„)♡\n` +
        `╭─∪∪────────────⟡\n` +
        `│ 𝗔𝗟𝗟 𝗚𝗥𝗢𝗨𝗣 𝗟𝗜𝗦𝗧\n` +
        `├───────────────⟡\n`;

      let map = [];

      for (let i = 0; i < groups.length; i++) {
        const chat = groups[i];

        msg +=
          `│ ${i + 1}. ${chat.title || "No Name"}\n` +
          `│ 🆔 ${chat.id}\n`;

        map.push({
          index: i + 1,
          chatId: chat.id
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
      message.reply("❌ | 𝙀𝙧𝙧𝙤𝙧 𝙁𝙚𝙩𝙘𝙝𝙞𝙣𝙜 𝙂𝙧𝙤𝙪𝙥𝙨");
    }
  },

  onReply: async ({ bot, event, message, Reply }) => {
    try {
      const num = parseInt(event.text);

      if (isNaN(num)) {
        return message.reply("❌ | 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙉𝙪𝙢𝙗𝙚𝙧");
      }

      const group = Reply.groups.find(g => g.index === num);

      if (!group) {
        return message.reply("❌ | 𝙂𝙧𝙤𝙪𝙥 𝙉𝙤𝙩 𝙁𝙤𝙪𝙣𝙙");
      }

      await bot.leaveChat(group.chatId);

      message.reply(
        `✅ | 𝙇𝙚𝙛𝙩 𝙂𝙧𝙤𝙪𝙥\n🆔 ${group.chatId}`
      );

    } catch (e) {
      console.log("REPLY ERROR:", e);
      message.reply("❌ | 𝙁𝙖𝙞𝙡𝙚𝙙 𝙏𝙤 𝙇𝙚𝙖𝙫𝙚");
    }
  }
};
