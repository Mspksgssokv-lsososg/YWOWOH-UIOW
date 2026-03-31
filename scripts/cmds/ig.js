module.exports.config = {
  name: "ig",
  version: "1.0",
  role: 0,
  author: "SK-SIDDIK-KHAN",
  description: "Islamic random post",
  category: "fun",
  usePrefix: false,
  usages: "{p}"
};

module.exports.onChat = async ({ bot, event }) => {
  const text = event.text?.trim() || "";
  const prefix = global.config.prefix;

  if (text !== prefix) return;

  try {
    const captions = [
      "🌸 আল্লাহর রহমত থেকে নিরাশ হয়ো না 🤲",
      "🖤 ইসলাম অহংকার না, শুকরিয়া শেখায়",
      "🌼 মৃত্যু নিশ্চিত, সময় অনিশ্চিত",
      "💗 Alhamdulillah for everything",
      "🤲 আল্লাহ সব দেখেন, ধৈর্য ধরো",
      "🕋 নামাজ জীবন বদলে দেয়"
    ];

    const links = [
      "https://i.postimg.cc/7LdGnyjQ/images-31.jpg",
      "https://i.postimg.cc/65c81ZDZ/images-30.jpg",
      "https://i.postimg.cc/Y0wvTzr6/images-29.jpg",
      "https://i.postimg.cc/1Rpnw2BJ/images-28.jpg",
      "https://i.postimg.cc/mgrPxDs5/images-27.jpg",
      "https://i.postimg.cc/yxXDK3xw/images-26.jpg"
    ];

    const i = Math.floor(Math.random() * captions.length);

    await bot.sendPhoto(event.chat.id, links[i], {
      caption: captions[i],
      reply_to_message_id: event.message_id
    });

  } catch (err) {
    console.log(err);
  }
};
