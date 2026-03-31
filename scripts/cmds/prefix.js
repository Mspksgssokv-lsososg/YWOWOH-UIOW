module.exports.config = {
  name: "prefix",
  version: "3.0.0",
  author: "SK-SIDDIK-KHAN",
  countDown: 0,
  role: 0,
  description: {
    en: "Show bot prefix",
  },
  category: "system",
};

module.exports.onChat = async ({ message, event }) => {
  try {
    const text = event.text?.toLowerCase().trim();

    if (text === "prefix") {
      const prefix = global.config.prefix || "/";

      message.reply(
`╭━━〔 PREFIX CMD 〕━━╮
┃ 𝘽𝙤𝙩 𝙋𝙧𝙚𝙛𝙞𝙭 => ${prefix}
╰━━━━━━━━━━━━━━━╯`
      );
    }

  } catch (err) {
    console.error(err);
  }
};
