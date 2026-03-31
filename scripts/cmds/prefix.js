module.exports.config = {
  name: "prefix",
  version: "1.0.2",
  author: "SK-SIDDIK-KHAN",
  countDown: 0,
  role: 0,
  description: {
    en: "Get or set the bot's prefix for the current group.",
  },
  category: "system",
  commandCategory: "system",
  guide: {
    en: "[current] - get current prefix, [new] - change prefix (e.g., `/prefix !`)",
  },
};

module.exports.run = async ({ message, event, threadsData }) => {
  try {
    const newPrefix = event.text?.split(" ")[1];

    if (!newPrefix) {
      return message.reply("❌ | Please specify a new prefix. Example: `/prefix !`");
    }

    const oldData = await threadsData.getThread(event.chat.id) || {};

    await threadsData.set(event.chat.id, {
      ...oldData,
      prefix: newPrefix
    });

    message.reply(`✅ | Prefix changed successfully to: ${newPrefix}`);

  } catch (error) {
    console.error("Error changing prefix:", error.message);
    message.reply(`❌ | Error changing prefix: ${error.message}`);
  }
};

module.exports.onChat = async ({ message, event, threadsData }) => {
  try {
    const mText = event.text?.toLowerCase() || "";

    if (mText === "prefix") {

      const thread = await threadsData.getThread(event.chat.id);

      const ppy = thread?.prefix || "Not set";
      const ppz = global.functions?.config?.prefix || "/";

      message.reply(
`╭━━━━━━━━━━━━━━━━━━━━╮
♡ | 𝙎𝙮𝙨𝙩𝙚𝙢 𝙋𝙧𝙚𝙛𝙞𝙭 => ${ppz}
♡ | 𝙔𝙤𝙪𝙧 𝙂𝙧𝙤𝙪𝙥 𝙋𝙧𝙚𝙛𝙞𝙭 => ${ppy}
╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

  } catch (error) {
    console.error("Error fetching prefix:", error.message);
    message.reply(`❌ | Prefix error: ${error.message}`);
  }
};