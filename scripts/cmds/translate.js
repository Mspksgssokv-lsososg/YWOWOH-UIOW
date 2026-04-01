const axios = require("axios");

const langs = ["af","sq","am","ar","bn","bg","ca","zh-cn","zh-tw","hr","cs","da","nl","en","fi","fr","de","el","hi","hu","id","it","ja","ko","ms","ne","no","pl","pt","ro","ru","es","sv","ta","te","th","tr","uk","ur","vi"];

async function translate(text, lang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await axios.get(url);
  return {
    text: res.data[0].map(i => i[0]).join(""),
    lang: res.data[2]
  };
}

module.exports = {
  config: {
    name: "tns",
    aliases: ["trans"],
    author: " SK-SIDDIK-KHAN",
    category: "utility",
    role: 0,
    cooldown: 5
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;

    try {
      let lang = "en";
      let text = "";

      if (args[0]) {
        const first = args[0].toLowerCase();
        if (langs.includes(first)) {
          lang = first;
          text = args.slice(1).join(" ");
        } else {
          text = args.join(" ");
        }
      }

      if (!text && msg.reply_to_message?.text) {
        text = msg.reply_to_message.text;
      }

      if (!text) {
        return bot.sendMessage(chatId, "❌ | Provide text or reply", {
          reply_to_message_id: msg.message_id
        });
      }

      const result = await translate(text, lang);

      return bot.sendMessage(
        chatId,
        `🌐 ${result.lang} → ${lang}\n${result.text}`,
        { reply_to_message_id: msg.message_id }
      );

    } catch {
      return bot.sendMessage(chatId, "❌ | Translation failed", {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
