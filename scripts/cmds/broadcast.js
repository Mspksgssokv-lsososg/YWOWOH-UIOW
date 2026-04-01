const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "broadcast",
    aliases: ["noti"],
    author: "SK-SIDDIK-KHAN",
    category: "admin",
    role: 2,
    usePrefix: false,
    cooldown: 5
  },

  onStart: async ({ msg, bot, args, senderName, username }) => {
    const text = args.join(" ");
    if (!text) {
      return bot.sendMessage(msg.chat.id, "❌ | Provide message", {
        reply_to_message_id: msg.message_id
      });
    }

    try {
      const filePath = path.join(process.cwd(), "threads.json");

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]");
      }

      const threads = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (!threads.length) {
        return bot.sendMessage(msg.chat.id, "❌ | No threads found", {
          reply_to_message_id: msg.message_id
        });
      }

      const time = moment()
        .tz("Asia/Dhaka")
        .format("DD MMM YYYY • HH:mm:ss");

      let success = 0;
      let failed = 0;

      for (const id of threads) {
        try {
          await bot.sendMessage(
            id,
            `📢 <b>BROADCAST</b>\n\n${text}\n\n⏰ ${time}\n👤 ${senderName} (@${username})`,
            { parse_mode: "HTML" }
          );
          success++;
        } catch {
          failed++;
        }
      }

      return bot.sendMessage(
        msg.chat.id,
        `✅ | Done\n✔️ ${success}\n❌ ${failed}`,
        { reply_to_message_id: msg.message_id }
      );

    } catch (err) {
      console.error(err);
      return bot.sendMessage(msg.chat.id, "❌ | Broadcast failed");
    }
  }
};
