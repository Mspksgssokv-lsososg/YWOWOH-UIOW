const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const chokidar = require("chokidar");

// ================= MIME =================
function getExtensionFromMimeType(mimeType = "") {
  const map = {
    "video/mp4": ".mp4",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".mp3",
    "audio/wav": ".wav"
  };
  return map[mimeType] || "";
}

// ================= DOWNLOAD =================
async function downloadFile(url, filePath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  await fs.writeFile(filePath, res.data);
}

// ================= MESSAGE =================
function message(bot, msg) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  async function sendErr(err) {
    const text =
      typeof err === "object"
        ? `${err.name}: ${err.message}`
        : err;

    return bot.sendMessage(chatId, `❌ | ${text}`, {
      reply_to_message_id: messageId
    });
  }

  return {
    send: (text, opt = {}) =>
      bot.sendMessage(chatId, text, opt).catch(sendErr),

    reply: (text, opt = {}) =>
      bot.sendMessage(chatId, text, {
        reply_to_message_id: messageId,
        ...opt
      }).catch(sendErr),

    unsend: (id) =>
      bot.deleteMessage(chatId, id).catch(() => {}),

    // ================= STREAM FIX =================
    stream: async ({ url, caption = "" }) => {
      try {
        // ⚡ Telegram direct URL support (BEST)
        if (url.startsWith("http")) {
          if (url.match(/\.(jpg|jpeg|png)$/i))
            return bot.sendPhoto(chatId, url, { caption });

          if (url.match(/\.(mp4)$/i))
            return bot.sendVideo(chatId, url, { caption });

          if (url.match(/\.(mp3|wav)$/i))
            return bot.sendAudio(chatId, url, { caption });
        }

        // ⚠️ fallback download system
        const file = path.join(process.cwd(), `temp_${Date.now()}`);
        await downloadFile(url, file);

        await bot.sendDocument(chatId, file, { caption });

        await fs.remove(file);

      } catch (e) {
        return sendErr(e);
      }
    },

    // ================= DOWNLOAD =================
    download: async ({ url, mimeType }) => {
      try {
        const ext = getExtensionFromMimeType(mimeType) || ".tmp";
        const file = path.join(process.cwd(), `temp_${Date.now()}${ext}`);

        await downloadFile(url, file);

        if (mimeType.startsWith("image"))
          await bot.sendPhoto(chatId, file);

        else if (mimeType.startsWith("video"))
          await bot.sendVideo(chatId, file);

        else if (mimeType.startsWith("audio"))
          await bot.sendAudio(chatId, file);

        await fs.remove(file);
      } catch (e) {
        return sendErr(e);
      }
    },

    code: (txt) =>
      bot.sendMessage(chatId, `\`\`\`js\n${txt}\n\`\`\``, {
        parse_mode: "Markdown"
      }),

    err: sendErr
  };
}
