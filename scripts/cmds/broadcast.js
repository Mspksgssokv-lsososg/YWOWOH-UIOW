const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bc",
    aliases: ["broadcast"],
    description: "Send broadcast message",
    version: "4.0.0",
    author: "SK-SIDDIK-KHAN",
    category: "admin",
    role: 2,
    usePrefix: true,
    cooldown: 5
  },

  run: async ({ bot, msg, args, message }) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const senderName =
      msg.from.first_name +
      (msg.from.last_name ? " " + msg.from.last_name : "");

    const username = msg.from.username || "none";

    const currentTime = new Date().toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka"
    });

    const copyrightMark = "© Powered by SIDDIK BOT";

    const threadFile = path.join(process.cwd(), "threads.json");

    if (!fs.existsSync(threadFile)) {
      fs.writeFileSync(threadFile, "[]");
    }

    let threadIDs = [];
    try {
      threadIDs = JSON.parse(fs.readFileSync(threadFile));
    } catch {
      threadIDs = [];
    }

    if (!threadIDs.includes(chatId)) {
      threadIDs.push(chatId);
      fs.writeFileSync(threadFile, JSON.stringify(threadIDs, null, 2));
    }

    const text =
      args.join(" ") ||
      msg.reply_to_message?.text ||
      "";

    if (!text) return message.reply("❌ | Please provide a message");

    if (!threadIDs.length)
      return message.reply("❌ | No users/groups found");

    const statusMsg = await message.reply("📤 | Broadcasting...");

    setTimeout(async () => {
      try {
        await bot.deleteMessage(chatId, statusMsg.message_id);
      } catch {}
    }, 3000);

    let success = 0;
    let fail = 0;

    const formatted = `
📢 <b>Broadcast Message</b> 📢
━━━━━━━━━━━━━━━━━━━━━━
<b>Message:</b> ${text}
━━━━━━━━━━━━━━━━━━━━━━
⏰ <b>Time:</b> ${currentTime}
━━━━━━━━━━ ❖ ━━━━━━━━━━
👤 <b>Sender Name:</b> ${senderName}
🔗 <b>Username:</b> @${username}
🆔 <b>UserID:</b> ${userId}
━━━━━━━━━━ ❖ ━━━━━━━━━━
${copyrightMark}
`;

    for (const id of threadIDs) {
      try {
        if (String(id) === String(chatId)) continue;

        await bot.sendMessage(id, formatted, {
          parse_mode: "HTML"
        });

        success++;
      } catch {
        fail++;
      }
    }

    const doneMsg = await message.reply(
      `✅ | Broadcast Completed\n━━━━━━━━━━━━━━━━━━\n👤 Success: ${success}\n❌ Failed: ${fail}`
    );

    setTimeout(async () => {
      try {
        await bot.deleteMessage(chatId, doneMsg.message_id);
      } catch {}
    }, 5000);
  }
};
