module.exports.config = {
  name: "prefix",
  version: "2.0.0",
  author: "SK-SIDDIK-KHAN",
  countDown: 0,
  role: 0,
  description: {
    en: "Show bot prefix",
  },
  category: "system",
};

module.exports.run = async ({ message }) => {
  const prefix = global.config.prefix || "/";

  message.reply(
`╭━━━━━━━━━━━━━━━━━━━━╮
♡ | 𝘽𝙤𝙩 𝙋𝙧𝙚𝙛𝙞𝙭 => ${prefix}
╰━━━━━━━━━━━━━━━━━━━━╯`
  );
};

module.exports.onChat = async ({ message, event }) => {
  try {
    const text = event.text?.toLowerCase().trim();

    if (text === "prefix") {
      const prefix = global.config.prefix || "/";

      message.reply(
`╭━━━━━━━━━━━━━━━━━━━━╮
♡ | 𝘽𝙤𝙩 𝙋𝙧𝙚𝙛𝙞𝙭 => ${prefix}
╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }
  } catch (err) {
    console.error(err);
  }
};
