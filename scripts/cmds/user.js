const fs = require("fs");
const path = require("path");

const banFile = path.join(process.cwd(), "banned.json");

if (!fs.existsSync(banFile)) {
  fs.writeFileSync(banFile, "[]");
}

function getBanned() {
  try {
    return JSON.parse(fs.readFileSync(banFile));
  } catch {
    return [];
  }
}

function saveBanned(data) {
  fs.writeFileSync(banFile, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "user",
    author: "SK-SIDDIK-KHAN',
    role: 2,
    category: "admin",
    description: "User ban system"
  },

  onStart: async ({ bot, msg, args }) => {
    const chatId = msg.chat.id;
    const action = args[0];

    let banned = getBanned();

    if (action === "list" || (action === "ban" && args[1] === "list")) {

      if (!banned.length) {
        return bot.sendMessage(chatId, "No banned users");
      }

      let text = "╭━━━━━━━━━━━━━━╮\n🚫 BANNED USERS\n╰━━━━━━━━━━━━━━╯\n\n";
      let i = 1;

      for (const id of banned) {
        try {
          const user = await bot.getChat(id);
          const name = user.first_name + (user.last_name ? " " + user.last_name : "");

          text += `${i++}. 👤 ${name}\n🆔 ${id}\n\n`;

        } catch (err) {
          text += `${i++}. 👤 Unknown User\n🆔 ${id}\n\n`;
        }
      }

      return bot.sendMessage(chatId, text);
    }

    if (action === "ban") {

      const userId =
        args[1] ||
        (msg.reply_to_message && msg.reply_to_message.from.id);

      if (!userId) {
        return bot.sendMessage(chatId,
`Usage:
/user ban <id/reply>
/user unban <id/reply>
/user list`
        );
      }

      if (banned.includes(String(userId))) {
        return bot.sendMessage(chatId, "Already banned");
      }

      banned.push(String(userId));
      saveBanned(banned);

      return bot.sendMessage(chatId, `🚫 Banned Successfully ${userId}`);
    }

    if (action === "unban") {

      const userId =
        args[1] ||
        (msg.reply_to_message && msg.reply_to_message.from.id);

      if (!userId) {
        return bot.sendMessage(chatId, "Reply or give userId");
      }

      if (!banned.includes(String(userId))) {
        return bot.sendMessage(chatId, "User not banned");
      }

      banned = banned.filter(id => id !== String(userId));
      saveBanned(banned);

      return bot.sendMessage(chatId, `✅ Unbanned Successfully ${userId}`);
    }

    return bot.sendMessage(chatId,
`Usage:
/user ban <id/reply>
/user unban <id/reply>
/user list`
    );
  }
};
