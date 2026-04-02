module.exports.config = {
  name: "tag",
  aliases: ["mention"],
  version: "2.1.0",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Advanced tag system",
  usePrefix: false,
  guide: "{p}tag | reply\n{p}tag all",
  category: "Utility",
  countDown: 5,
};

module.exports.run = async ({ message, event, bot, args }) => {
  try {
    const chatId = event.chat.id;

    if (event.reply_to_message && args.length === 0) {
      const user = event.reply_to_message.from;
      const name = user.username || user.first_name || "User";

      return bot.sendMessage(chatId, `📢 @${name}`, {
        entities: [
          {
            type: "text_mention",
            offset: 2,
            length: name.length + 1,
            user: { id: user.id },
          },
        ],
      });
    }

    const admins = await bot.getChatAdministrators(chatId);
    const isAdmin = admins.some(a => a.user.id === event.from.id);

    if (args[0] === "all") {
      if (!isAdmin) {
        return message.reply("⚠️ | Only Group Admin can use tag all");
      }

      let text = "📢 Tagging admins:\n";
      let entities = [];
      let offset = text.length;

      for (let member of admins) {
        const name = member.user.first_name;
        text += `@${name} `;

        entities.push({
          type: "text_mention",
          offset: offset,
          length: name.length + 1,
          user: { id: member.user.id },
        });

        offset += name.length + 2;
      }

      return bot.sendMessage(chatId, text, { entities });
    }

    return message.reply(
      "Usage:\n- Reply + tag\n- /tag all"
    );

  } catch (err) {
    console.error(err);
    message.reply("❌ Error: " + err.message);
  }
};