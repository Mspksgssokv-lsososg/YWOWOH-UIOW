const axios = require("axios");

module.exports.config = {
  name: "ig",
  version: "1.0",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Islamic post",
  category: "fun",
  usePrefix: false,
  usages: "{p}"
};

module.exports.onChat = async ({ message, event }) => {
  const text = event.text?.trim() || "";
  const prefix = global.config.prefix;

  if (text !== prefix) return;

  try {
    const captions = [
      "🌸 আল্লাহর রহমত থেকে নিরাশ হয়ো না 🤲",
      "🖤 ইসলাম অহংকার না, শুকরিয়া শেখায়",
      "🌼 মৃত্যু নিশ্চিত, সময় অনিশ্চিত",
      "💗 Alhamdulillah for everything"
    ];

    const links = [
      "https://i.postimg.cc/7LdGnyjQ/images-31.jpg",
      "https://i.postimg.cc/65c81ZDZ/images-30.jpg",
      "https://i.postimg.cc/Y0wvTzr6/images-29.jpg",
      "https://i.postimg.cc/1Rpnw2BJ/images-28.jpg"
    ];

    const i = Math.floor(Math.random() * captions.length);

    // ✅ stream fix
    const res = await axios.get(links[i], { responseType: "stream" });

    await message.reply({
      body: captions[i],
      attachment: res.data
    });

  } catch (err) {
    message.reply("❌ Error: " + err.message);
  }
};
