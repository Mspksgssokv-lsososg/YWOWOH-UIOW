const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

module.exports = {
  config: {
    name: "catbox",
    author: "SK-SIDDIK-KHAN",
    description: "Upload replied photo/video to Catbox",
    category: "Tools",
    role: 0,
    cooldown: 5,
    usePrefix: false
  },

  onStart: async ({ bot, msg }) => {
    const chatId = msg.chat.id;

    if (!msg.reply_to_message)
      return bot.sendMessage(chatId, "❌ Reply to image/video");

    const reply = msg.reply_to_message;
    let fileId, ext;

    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
      ext = ".jpg";
    } else if (reply.video) {
      fileId = reply.video.file_id;
      ext = ".mp4";
    } else {
      return bot.sendMessage(chatId, "❌ Only image/video supported");
    }

    const tempPath = path.join(__dirname, `temp_${Date.now()}${ext}`);

    let progressAnim;

    try {
      const loadingMsg = await bot.sendMessage(chatId, "⏳ Uploading...");

      const steps = [
        "[███░░░░░░░] 30%",
        "[██████░░░░] 60%",
        "[████████░░] 80%",
        "[██████████] 100%"
      ];

      let i = 0;
      progressAnim = setInterval(() => {
        if (i >= steps.length) return;
        bot.editMessageText(steps[i], {
          chat_id: chatId,
          message_id: loadingMsg.message_id
        }).catch(() => {});
        i++;
      }, 1200);

      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      const res = await axios.get(fileUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(tempPath);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fs.createReadStream(tempPath));

      const upload = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        { headers: form.getHeaders() }
      );

      clearInterval(progressAnim);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

      await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

      return bot.sendMessage(chatId, `✅ Uploaded\n${upload.data}`);

    } catch (err) {
      clearInterval(progressAnim);

      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

      console.log("❌ Catbox Error:", err.message);

      return bot.sendMessage(chatId, "❌ Upload failed");
    }
  }
};
