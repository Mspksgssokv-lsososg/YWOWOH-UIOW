const axios = require("axios");

module.exports.config = {
  name: "tns",
  aliases: ["trans"],
  author: "SK-SIDDIK-KHAN",
  countDown: 5,
  role: 0,
  description: "Translate",
  category: "Utility",
  usePrefix: false
};

async function translate(text, lang) {
  try {
    const res = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
    );
    return res.data?.[0]?.map(i => i[0]).join("") || "❌ Translate error";
  } catch {
    return "❌ API error";
  }
}

module.exports.onStart = async ({ event, args, message }) => {
  try {
    const lang = args[0]?.toLowerCase();

    const replyMsg =
      event.message?.reply_to_message ||
      event.reply_to_message ||
      event.replyMessage ||
      event.messageReply;

    if (!lang) {
  return message.reply(
`╭─✦『 TRANSLATE GUIDE 』✦──╮
│──────────────                
├‣ 🇺🇸 tns en - English
├‣ 🇧🇩 tns bn - Bangla
├‣ 🇮🇳 tns hi -  Hindi
├‣ 🇰🇷 tns ko - Korean
├‣ 🇻🇳 tns vi - Vietnamese  
│──────────────
│💬 Reply any message⚡ Example: tns bn           
╰─────────────────────╯`
  );
}

    if (!replyMsg) {
      return message.reply("❌ | Reply to a message");
    }

    const text =
      replyMsg.text ||
      replyMsg.caption ||
      replyMsg.body;

    if (!text) {
      return message.reply("❌ | No text found");
    }

    const allowed = ["en", "bn", "hi", "ko", "vi"];
    if (!allowed.includes(lang)) {
      return message.reply("❌ | Invalid language");
    }

    const translated = await translate(text, lang);

    return message.reply(`🌐 ${lang.toUpperCase()}:\n${translated}`);

  } catch (err) {
    console.error(err);
    return message.reply("❌ | Translate failed");
  }
};