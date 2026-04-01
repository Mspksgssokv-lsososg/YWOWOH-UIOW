const { adminBot = [], botOperator = [] } = global.config; // ✅ FIX

module.exports.config = {
  name: "call",
  aliases: ["report"],
  version: "1.1.0",
  role: 0,
  author: "dipto",
  description: "Send a call/report to bot admins and operators.",
  usePrefix: true,
  guide: "[message]",
  category: "Report",
  countDown: 5,
};

// 🔁 REPLY SYSTEM
module.exports.onReply = async function ({ message, event, Reply, api, usersData }) {
  const { type, target, message_ID, author } = Reply;

  try {
    // ✅ ADMIN REPLY → USER
    if (
      type === "adminReply" &&
      (adminBot.includes(event.from.id) || botOperator.includes(event.from.id))
    ) {
      const feedbackMessage = event.text;
      const adminName = await usersData.getName(event.from.id);

      const info = await api.sendMessage(
        target,
        `📩 Reply from Admin (${adminName}):\n${feedbackMessage}`,
        { reply_to_message_id: message_ID }
      );

      global.functions.onReply.set(info.message_id, {
        commandName: module.exports.config.name, // ✅ FIX
        type: "userReply",
        message_ID: info.message_id,
        author: event.from.id,
        target: event.chat.id,
      });

      return message.reply("✅ | Reply sent to user.");
    }

    // ✅ USER REPLY → ADMIN
    else if (type === "userReply") {
      const userMessage = event.text;
      const userName = await usersData.getName(event.from.id);

      const info = await api.sendMessage(
        author,
        `📨 Message from User (${userName}):\n${userMessage}`
      );

      global.functions.onReply.set(info.message_id, {
        commandName: module.exports.config.name, // ✅ FIX
        type: "adminReply",
        message_ID: event.message_id,
        author: event.from.id,
        target: event.chat.id,
      });

      return message.reply("✅ | Message sent to admin.");
    }
  } catch (err) {
    console.log("Error in onReply:", err.message);
    return message.reply(`❌ | Error: ${err.message}`);
  }
};

// 🚀 START COMMAND
module.exports.onStart = async function ({ api, message, args, event, usersData }) {
  try {
    const author = event.from.id;
    const reportMessage = args.join(" ").trim();

    if (!reportMessage) {
      return message.reply(
        "⚠️ | Please provide a message.\nExample:\n/call Bot is not working"
      );
    }

    for (const recipient of adminBot) {
      const info = await api.sendMessage(
        recipient,
        `📢 REPORT\nFrom: ${await usersData.getName(author)}\n\nMessage: ${reportMessage}\n\n↩️ Reply to respond.`
      );

      global.functions.onReply.set(info.message_id, {
        commandName: module.exports.config.name, // ✅ FIX
        type: "adminReply",
        message_ID: event.message_id,
        author: author,
        target: event.chat.id,
      });
    }

    return message.reply("✅ | Report sent to admins.");
  } catch (error) {
    console.log("Report Error:", error.message);
    return message.reply(`❌ | Error: ${error.message}`);
  }
};
