const axios = require("axios");

async function baseApiUrl() {
  const res = await axios.get(
    "https://noobs-api-team-url.vercel.app/N1SA9/baseApiUrl.json"
  );
  return res.data.api;
}

module.exports = {
  config: {
    name: "baby",
    aliases: ["lisa", "bbe", "babe", "bby"],
    version: "6.9.0",
    author: "dipto",
    role: 0,
    description: "Better than all sim simi",
    commandCategory: "chat",
    guide: "/baby <message>",
  },

  run: async function ({ message, args, msg }) {
    const text = args.join(" ").toLowerCase();
    const uid = msg.from.id;

    try {
      const base = await baseApiUrl();
      const link = `${base}/baby`;

      // no args
      if (!text) {
        const ran = [
          "Bolo baby 💕",
          "hum 👀",
          "type /baby hi",
          "yes baby 😃",
          "hey i am here 😃"
        ];
        return message.reply(ran[Math.floor(Math.random() * ran.length)]);
      }

      // remove
      if (text.startsWith("remove ")) {
        const q = text.replace("remove ", "");
        const res = await axios.get(`${link}?remove=${q}`);
        return message.reply(res.data.message || "Removed");
      }

      // rm with index
      if (text.startsWith("rm ") && text.includes("-")) {
        const [msgText, index] = text.replace("rm ", "").split(/\s*-\s*/);
        const res = await axios.get(
          `${link}?remove=${msgText}&index=${index}`
        );
        return message.reply(res.data.message || "Removed");
      }

      // list
      if (text === "list") {
        const res = await axios.get(`${link}?list=all`);
        return message.reply(`Total Teach = ${res.data.length}`);
      }

      // msg
      if (text.startsWith("msg ")) {
        const q = text.replace("msg ", "");
        const res = await axios.get(`${link}?list=${q}`);
        return message.reply(`Message "${q}" = ${res.data.data}`);
      }

      // edit
      if (text.startsWith("edit ") && text.includes("-")) {
        const [q, rep] = text.replace("edit ", "").split(/\s*-\s*/);
        const res = await axios.get(
          `${link}?edit=${q}&replace=${rep}`
        );
        return message.reply(res.data.message || "Edited");
      }

      // teach
      if (text.startsWith("teach ") && text.includes("-")) {
        const [q, rep] = text.replace("teach ", "").split(/\s*-\s*/);
        const res = await axios.get(
          `${link}?teach=${q}&reply=${rep}&senderID=${uid}`
        );
        return message.reply(`✅ Replies added\nTeachs: ${res.data.teachs}`);
      }

      // default chat
      const res = await axios.get(
        `${link}?text=${encodeURIComponent(text)}&senderID=${uid}`
      );
      return message.reply(res.data.reply || "🙂");

    } catch (err) {
      console.error(err);
      message.reply("❌ Error occurred");
    }
  },
};
