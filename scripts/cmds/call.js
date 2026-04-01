const { admins, botOperator } = global.config;

module.exports.config = {
  name: "call",
  aliases: ["report"],
  version: "2.0.0",
  role: 0,
  author: "dipto",
  description: "Send a call/report to bot admins and operators.",
  usePrefix: true,
  guide: "[message]",
  category: "Report",
  countDown: 5,
};

// ================== REPLY SYSTEM ==================
module.exports.onReply = async ({ message, event, Reply, api, usersData }) => {
  const { type, target, message_ID, author } = Reply;

  try {

    // 🔁 ADMIN REPLY → USER
    if (
      type === "adminReply" &&
      (admins.includes(event.from.id) || botOperator.includes(event.from.id))
    ) {
      const adminName = await usersData.getName(event.from.id);
      const feedbackMessage = event.text;

      const info = await api.sendMessage(
        target,
        `📩 Reply from Admin (${adminName}):\n${feedbackMessage}`,
        { reply_to_message_id: message_ID }
      );

      global.client.onReply.set(info.message_id, {
        commandName: this.config.name,
        type: "userReply",
        message_ID: info.message_id,
        author: event.from.id,
        target: target,
      });

      return message.reply("✅ | Reply sent to user");
    }

    // 🔁 USER REPLY → ADMIN
    else if (type === "userReply") {
      const userName = await usersData.getName(event.from.id);
      const userMessage = event.text;

      const info = await api.sendMessage(
        author,
        `📨 Message from User (${userName}):\n${userMessage}`
      );

      global.client.onReply.set(info.message_id, {
        commandName: this.config.name,
        type: "adminReply",
        message_ID: event.message_id,
        author: event.from.id,
        target: event.chat.id,
      });

      return message.reply("✅ | Message sent to admin");
    }

  } catch (err) {
    console.log("Reply Error:", err.message);
    message.reply("❌ | Reply system error");
  }
};

// ================== START ==================
module.exports.onStart = async ({ api, message, args, event, usersData }) => {
  try {
    const author = event.from.id;
    const reportMessage = args.join(" ").trim();

    if (!reportMessage) {
      return message.reply(
        "⚠️ | Example:\n/call This is a report message"
      );
    }

    // 🔥 SEND TO ALL ADMINS
    for (const adminID of admins) {
      try {
        const info = await api.sendMessage(
          adminID,
          `📢 REPORT\nFrom: ${await usersData.getName(author)}\n\nMessage:\n${reportMessage}\n\n↩️ Reply to respond`
        );

        // save reply
        global.client.onReply.set(info.message_id, {
          commandName: this.config.name,
          type: "adminReply",
          message_ID: event.message_id,
          author: author,
          target: event.chat.id,
        });

        console.log("✅ Sent to admin:", adminID);

      } catch (e) {
        console.log("❌ Failed to send to:", adminID, e.message);
      }
    }

    message.reply("✅ | Report sent to admins");

  } catch (error) {
    console.log("Start Error:", error.message);
    message.reply("❌ | Failed to send report");
  }
};
