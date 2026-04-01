const { admins, botOperator } = global.config;

module.exports.config = {
  name: "call",
  aliases: ["report"],
  version: "3.0.0",
  role: 0,
  author: "dipto",
  description: "Send a call/report to bot admins and operators.",
  usePrefix: true,
  guide: "[message]",
  category: "Report",
  countDown: 5,
};

// ================== REPLY SYSTEM ==================
module.exports.onReply = async ({ bot, message, event, Reply, usersData }) => {
  const { type, target, message_ID, author } = Reply;

  try {

    // 🔁 ADMIN → USER
    if (
      type === "adminReply" &&
      (admins.includes(event.from.id) || botOperator.includes(event.from.id))
    ) {
      const adminName = await usersData.getName(event.from.id);
      const text = event.text;

      const msg = await bot.sendMessage(
        target,
        `📩 Reply from Admin (${adminName}):\n${text}`,
        { reply_to_message_id: message_ID }
      );

      global.client.onReply.set(msg.message_id, {
        commandName: this.config.name,
        type: "userReply",
        message_ID: msg.message_id,
        author: event.from.id,
        target: target,
      });

      return message.reply("✅ | Reply sent to user");
    }

    // 🔁 USER → ADMIN
    if (type === "userReply") {
      const userName = await usersData.getName(event.from.id);
      const text = event.text;

      const msg = await bot.sendMessage(
        author,
        `📨 Message from User (${userName}):\n${text}`
      );

      global.client.onReply.set(msg.message_id, {
        commandName: this.config.name,
        type: "adminReply",
        message_ID: event.message_id,
        author: event.from.id,
        target: event.chat.id,
      });

      return message.reply("✅ | Message sent to admin");
    }

  } catch (err) {
    console.log("❌ Reply Error:", err.message);
    message.reply("❌ | Reply system error");
  }
};

// ================== START ==================
module.exports.onStart = async ({ bot, message, args, event, usersData }) => {
  try {
    const author = event.from.id;
    const reportMessage = args.join(" ").trim();

    if (!reportMessage) {
      return message.reply("⚠️ | Example:\n/call Hello admin");
    }

    let success = 0;

    for (const adminID of admins) {
      try {
        const msg = await bot.sendMessage(
          adminID,
          `📢 REPORT\nFrom: ${await usersData.getName(author)}\n\nMessage:\n${reportMessage}\n\n↩️ Reply to respond`
        );

        global.client.onReply.set(msg.message_id, {
          commandName: this.config.name,
          type: "adminReply",
          message_ID: event.message_id,
          author: author,
          target: event.chat.id,
        });

        console.log("✅ Sent to admin:", adminID);
        success++;

      } catch (e) {
        console.log("❌ Failed to send to:", adminID, e.message);
      }
    }

    if (success === 0) {
      return message.reply("❌ | Failed! Admin didn't receive message");
    }

    message.reply("✅ | Report sent to admins");

  } catch (error) {
    console.log("❌ Start Error:", error.message);
    message.reply("❌ | Failed to send report");
  }
};
