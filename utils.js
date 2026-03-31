const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const chokidar = require("chokidar");

// ================= STREAM FROM URL =================
async function getStreamFromURL(url) {
  try {
    const res = await axios.get(url, { responseType: "stream" });
    return res.data;
  } catch (err) {
    throw new Error("Failed to get stream");
  }
}

// ================= EXTENSION =================
async function getExtensionFromUrl(mediaUrl) {
  try {
    const response = await axios.get(mediaUrl, { responseType: "stream" });
    const type = response.headers["content-type"];
    return getExtensionFromMimeType(type) || path.extname(new URL(mediaUrl).pathname).toLowerCase();
  } catch {
    return path.extname(mediaUrl).toLowerCase();
  }
}

function getExtensionFromMimeType(mimeType = "") {
  const map = {
    "video/mp4": ".mp4",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
    "audio/wav": ".wav"
  };
  return map[mimeType] || "";
}

// ================= DOWNLOAD =================
async function downloadFile(url, downloadPath) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(downloadPath, Buffer.from(res.data));
  } catch (err) {
    throw new Error("Download failed");
  }
}

// ================= MESSAGE UTILS =================
function message(bot, msg) {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  async function sendErr(err) {
    const text =
      typeof err === "object"
        ? `${err.name || "Error"}: ${err.message}`
        : err;

    return bot.sendMessage(chatId, `❌ | ${text}`, {
      reply_to_message_id: messageId
    });
  }

  return {
    send: async (text, opt = {}) => {
      try {
        return await bot.sendMessage(chatId, text, opt);
      } catch (e) {
        return sendErr(e);
      }
    },

    reply: async (text, opt = {}) => {
      try {
        return await bot.sendMessage(chatId, text, {
          reply_to_message_id: messageId,
          ...opt
        });
      } catch (e) {
        return sendErr(e);
      }
    },

    unsend: async (id) => {
      try {
        return await bot.deleteMessage(chatId, id);
      } catch {}
    },

    // ✅ STREAM FIXED
    stream: async ({ url, caption = "" }) => {
      try {
        const ext = url.startsWith("http")
          ? await getExtensionFromUrl(url)
          : path.extname(url).toLowerCase();

        const options = {
          caption,
          reply_to_message_id: messageId
        };

        if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
          return bot.sendPhoto(chatId, url, options);
        }

        if ([".mp4", ".mov"].includes(ext)) {
          return bot.sendVideo(chatId, url, options);
        }

        if ([".mp3", ".wav", ".m4a"].includes(ext)) {
          return bot.sendAudio(chatId, url, options);
        }

        throw new Error("Unsupported media type");
      } catch (e) {
        return sendErr(e);
      }
    },

    // ✅ DOWNLOAD FIXED
    download: async ({ url, mimeType }) => {
      try {
        const ext = getExtensionFromMimeType(mimeType) || ".tmp";
        const file = path.join(process.cwd(), `temp_${Date.now()}${ext}`);

        await downloadFile(url, file);

        const options = { reply_to_message_id: messageId };

        if (mimeType.startsWith("image")) {
          await bot.sendPhoto(chatId, file, options);
        } else if (mimeType.startsWith("video")) {
          await bot.sendVideo(chatId, file, options);
        } else if (mimeType.startsWith("audio")) {
          await bot.sendAudio(chatId, file, options);
        } else {
          throw new Error("Unsupported file type");
        }

        await fs.remove(file);
      } catch (e) {
        return sendErr(e);
      }
    },

    code: async (txt) => {
      try {
        return await bot.sendMessage(
          chatId,
          `\`\`\`js\n${txt}\n\`\`\``,
          {
            parse_mode: "Markdown",
            reply_to_message_id: messageId
          }
        );
      } catch (e) {
        return sendErr(e);
      }
    },

    err: sendErr
  };
}

// ================= LOAD =================
function loadScripts(bot) {
  const cmdPath = path.join(process.cwd(), "scripts", "cmds");
  const evPath = path.join(process.cwd(), "scripts", "events");

  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath, { recursive: true });
  if (!fs.existsSync(evPath)) fs.mkdirSync(evPath, { recursive: true });

  // LOAD COMMANDS
  fs.readdirSync(cmdPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      delete require.cache[require.resolve(path.join(cmdPath, file))];

      const cmd = require(path.join(cmdPath, file));
      if (!cmd.config?.name) return;

      global.commands.set(cmd.config.name, cmd);
      console.log("✅ CMD LOADED:", cmd.config.name);
    } catch (err) {
      console.log("❌ CMD ERROR:", file);
    }
  });

  // LOAD EVENTS
  fs.readdirSync(evPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      delete require.cache[require.resolve(path.join(evPath, file))];

      const name = path.parse(file).name;
      const ev = require(path.join(evPath, file));
      if (typeof ev.run !== "function") return;

      const handler = (...args) => ev.run({ bot, event: args[0] });

      bot.on(name, handler);
      global.events.set(name, handler);

      console.log("✅ EVENT LOADED:", name);
    } catch (err) {
      console.log("❌ EVENT ERROR:", file);
    }
  });

  // HOT RELOAD
  chokidar.watch([cmdPath, evPath]).on("change", file => {
    try {
      delete require.cache[require.resolve(file)];

      if (file.includes("cmds")) {
        const cmd = require(file);
        if (!cmd.config?.name) return;

        global.commands.set(cmd.config.name, cmd);
        console.log("♻️ CMD RELOADED:", cmd.config.name);
      }

      if (file.includes("events")) {
        const name = path.parse(file).name;

        if (global.events.has(name)) {
          bot.removeListener(name, global.events.get(name));
        }

        const ev = require(file);
        if (typeof ev.run !== "function") return;

        const handler = (...args) => ev.run({ bot, event: args[0] });

        bot.on(name, handler);
        global.events.set(name, handler);

        console.log("♻️ EVENT RELOADED:", name);
      }
    } catch (err) {
      console.log("❌ RELOAD ERROR:", file);
    }
  });
}

module.exports = {
  messageUtils: message,
  loadScripts,
  getStreamFromURL
};
