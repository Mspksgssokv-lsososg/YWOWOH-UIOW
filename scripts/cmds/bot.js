const axios = require("axios");

async function baseApiUrl() {
  const res = await axios.get(
    "https://noobs-api-team-url.vercel.app/N1SA9/baseApiUrl.json"
  );
  return res.data.api;
}

module.exports = {
  config: {
    name: "babe",
    aliases: ["bby", "bbe", "baby", "lisa"],
    version: "1.0",
    author: "Dipto",
    role: 0,
    description: "Talk to baby bot",
    commandCategory: "fun",
    guide: "/babe <message>",
  },

  run: async function ({ message, args, msg }) {
    const userMessage = args.join(" ");
    if (!userMessage) {
      return message.reply("Please provide a message");
    }

    try {
      const link = await baseApiUrl();
      const senderID = msg.from.id;

      const apiUrl = `${link}/baby?text=${encodeURIComponent(
        userMessage
      )}&senderID=${senderID}`;

      const response = await axios.get(apiUrl);
      const replyText = response.data.reply || "No response";

      await message.reply(replyText);
    } catch (err) {
      console.error(err);
      message.reply("❌ API Error");
    }
  },
};
