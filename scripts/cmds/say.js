const { createReadStream, unlinkSync, createWriteStream, existsSync, mkdirSync } = require("fs-extra");
const { resolve } = require("path");
const axios = require("axios");

const langs = ["af","sq","am","ar","bn","bg","ca","zh-CN","zh-TW","hr","cs","da","nl","en","fi","fr","de","el","hi","hu","id","it","ja","ko","ms","ne","no","pl","pt","ro","ru","es","sv","ta","te","th","tr","uk","ur","vi"];

async function fetchTTS(text, lang) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  return axios({ url, method: "GET", responseType: "stream" });
}

module.exports = {
  config: {
    name: "say",
    aliases: ["tts"],
    author: " SK-SIDDIK-KHAN",
    category: "general",
    role: 0,
    cooldown: 5
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;

    try {
      let lang = "en";
      let text = "";

      if (args[0]?.startsWith("-")) {
        lang = args[0].slice(1).toLowerCase();
        if (!langs.includes(lang)) {
          return bot.sendMessage(chatId, "❌ | Invalid language code", {
            reply_to_message_id: msg.message_id
          });
        }
        text = args.slice(1).join(" ");
      } else {
        text = args.join(" ");
      }

      if (!text && msg.reply_to_message?.text) {
        text = msg.reply_to_message.text;
      }

      if (!text) {
        return bot.sendMessage(chatId, "❌ | Provide text or reply", {
          reply_to_message_id: msg.message_id
        });
      }

      const cache = resolve(__dirname, "cache");
      if (!existsSync(cache)) mkdirSync(cache, { recursive: true });

      const file = resolve(cache, `${chatId}_${Date.now()}.mp3`);

      const res = await fetchTTS(text, lang);

      const writer = createWriteStream(file);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await bot.sendAudio(chatId, createReadStream(file), {
        reply_to_message_id: msg.message_id
      });

      unlinkSync(file);

    } catch (err) {
      return bot.sendMessage(chatId, "❌ | TTS failed", {
        reply_to_message_id: msg.message_id
      });
    }
  }
};
