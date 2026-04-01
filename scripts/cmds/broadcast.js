module.exports = {
  config: {
    name: "bc",
    aliases: ["broadcast"],
    description: "Send a broadcast message to all users and groups",
    version: "1.0.2",
    author: "SK-SIDDIK-KHAN",
    category: "admin",
    role: 2,
    usePrefix: true,
    cooldown: 5
  },

  run: async ({ bot, msg, args, message }) => {
    const chatId = msg.chat.id;

    const fs = require("fs");
    const path = require("path");

    const threadFile = path.join(process.cwd(), "threads.json");

    if (!fs.existsSync(threadFile)) {
      fs.writeFileSync(threadFile, "[]");
    }

    let threadIDs = [];
    try {
      threadIDs = JSON.parse(fs.readFileSync(threadFile));
    } catch {
      threadIDs = [];
      fs.writeFileSync(threadFile, "[]");
    }

    if (!threadIDs.includes(chatId)) {
      threadIDs.push(chatId);
      fs.writeFileSync(threadFile, JSON.stringify(threadIDs));
    }

    const text =
      args.join(" ") ||
      (msg.reply_to_message?.text || "");

    if (!text)
      return message.reply("❌ | Please provide a message");

    if (!threadIDs.length)
      return message.reply("❌ | No users/groups found");

    await message.reply("📤 | Broadcasting...");

    let success = 0;
    let fail = 0;

    for (const id of threadIDs) {
      try {
        if (String(id) === String(chatId)) continue;

        await bot.sendMessage(id, `📢 Broadcast\n\n${text}`);
        success++;
      } catch {
        fail++;
      }
    }

    return message.reply(
      `✅ | Done\n👤 Success: ${success}\n❌ Fail: ${fail}`
    );
  }
};
