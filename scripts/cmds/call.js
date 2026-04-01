const { admins, botOperator } = global.config;

const messages = {
  success: (count) => `✅ | Sent your message to ${count} admin successfully!`,
  failed: (count) => `❌ | Failed to send message to ${count} admin\nCheck console`,
  reply: (name, text) => 
`📍 Reply from admin ${name}
─────────────────
${text}
─────────────────
Reply this message to continue chatting`,
  replySuccess: "✅ | Reply sent to admin",
  replyUserSuccess: "✅ | Reply sent to user",
  feedback: (name, id, text) => 
`📝 Feedback from user ${name}
- User ID: ${id}

Content:
─────────────────
${text}
─────────────────
Reply this message to send message to user`,
  noAdmin: "❌ | No admin available",
  noMessage: "⚠️ | Example:\n/call Hello admin",
  error: "❌ | Reply system error",
  sendError: "❌ | Failed to send report"
};

module.exports.config = {
  name: "call",
  aliases: ["report"],
  version: "4.0.0",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Send a call/report to bot admins and operators.",
  usePrefix: true,
  guide: "[message]",
  category: "Report",
  countDown: 5,
};

module.exports.onReply = async ({ bot, message, event, Reply, usersData }) => {
  const { type, target, message_ID, author } = Reply;

  try {

    if (
      type === "adminReply" &&
      (admins.includes(event.from.id) || botOperator.includes(event.from.id))
    ) {
      const adminName = await usersData.getName(event.from.id);
      const text = event.text;

      const msg = await bot.sendMessage(
        target,
        messages.reply(adminName, text),
        { reply_to_message_id: message_ID }
      );

      global.functions.onReply.set(msg.message_id, {
        commandName: module.exports.config.name,
        type: "userReply",
        message_ID: msg.message_id,
        author: event.from.id,
        target: target,
      });

      return message.reply(messages.replyUserSuccess);
    }

    if (type === "userReply") {
      const userName = await usersData.getName(event.from.id);
      const text = event.text;

      const msg = await bot.sendMessage(
        author,
        messages.feedback(userName, event.from.id, text)
      );

      global.functions.onReply.set(msg.message_id, {
        commandName: module.exports.config.name,
        type: "adminReply",
        message_ID: event.message_id,
        author: event.from.id,
        target: event.chat.id,
      });

      return message.reply(messages.replySuccess);
    }

  } catch (err) {
    console.log("❌ Reply Error:", err.message);
    message.reply(messages.error);
  }
};

module.exports.onStart = async ({ bot, message, args, event, usersData }) => {
  try {
    const author = event.from.id;
    const reportMessage = args.join(" ").trim();

    if (!reportMessage) {
      return message.reply(messages.noMessage);
    }

    if (!admins || admins.length === 0) {
      return message.reply(messages.noAdmin);
    }

    let success = 0;
    let failed = 0;

    for (const adminID of admins) {
      try {
        const msg = await bot.sendMessage(
          adminID,
          messages.feedback(
            await usersData.getName(author),
            author,
            reportMessage
          )
        );

        global.functions.onReply.set(msg.message_id, {
          commandName: module.exports.config.name,
          type: "adminReply",
          message_ID: event.message_id,
          author: author,
          target: event.chat.id,
        });

        console.log("✅ Sent to admin:", adminID);
        success++;

      } catch (e) {
        console.log("❌ Failed to send to:", adminID, e.message);
        failed++;
      }
    }

    if (success > 0) {
      message.reply(messages.success(success));
    } else {
      message.reply(messages.failed(failed));
    }

  } catch (error) {
    console.log("❌ Start Error:", error.message);
    message.reply(messages.sendError);
  }
};
