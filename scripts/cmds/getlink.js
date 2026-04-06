module.exports = {
  config: {
    name: "getlink",
    version: "3.0",
    author: "SK-SIDDIK-KHAN",
    role: 0,
    usePrefix: false,
    category: "media"
  },

  onStart: async function ({ bot, message, event }) {

    const reply = event.reply_to_message;

    if (!reply) {
      return message.reply("⚠️ | Reply to photo/video");
    }

    try {
      let link;

      if (reply.photo) {
        const fileId = reply.photo[reply.photo.length - 1].file_id;
        link = await bot.getFileLink(fileId);
      }

      else if (reply.video) {
        const fileId = reply.video.file_id;
        link = await bot.getFileLink(fileId);
      }

      else {
        return message.reply("❌ | Only photo/video supported");
      }

      return message.reply(link);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to get link");
    }
  }
};
