const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const chokidar = require("chokidar");
const config = require("./config.json");

// ================= EXTENSION =================
async function getExtensionFromUrl(mediaUrl) {
  const response = await axios.get(mediaUrl, { responseType: "stream" });
  const type = response.headers["content-type"];
  return getExtensionFromMimeType(type) || path.extname(new URL(mediaUrl).pathname);
}

function getExtensionFromMimeType(mimeType) {
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
async function downloadFile(url, downloadPath) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(downloadPath, Buffer.from(res.data));
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
    send: async (text, opt = {}) =>
      bot.sendMessage(chatId, text, opt).catch(sendErr),

    reply: async (text, opt = {}) =>
      bot.sendMessage(chatId, text, {
        reply_to_message_id: messageId,
        ...opt
      }).catch(sendErr),

    unsend: async (id) =>
      bot.deleteMessage(chatId, id).catch(sendErr),

    stream: async ({ url, caption = "" }) => {
      try {
        const ext = url.startsWith("http")
          ? await getExtensionFromUrl(url)
          : path.extname(url);

        if ([".jpg", ".png"].includes(ext))
          return bot.sendPhoto(chatId, url, { caption });

        if ([".mp4"].includes(ext))
          return bot.sendVideo(chatId, url, { caption });

        if ([".mp3"].includes(ext))
          return bot.sendAudio(chatId, url, { caption });

        throw new Error("Unsupported media");
      } catch (e) {
        sendErr(e);
      }
    },

    download: async ({ url, mimeType }) => {
      try {
        const ext = getExtensionFromMimeType(mimeType) || ".tmp";
        const file = path.join(process.cwd(), "temp" + ext);

        await downloadFile(url, file);

        if (mimeType.startsWith("image"))
          await bot.sendPhoto(chatId, file);

        else if (mimeType.startsWith("video"))
          await bot.sendVideo(chatId, file);

        else if (mimeType.startsWith("audio"))
          await bot.sendAudio(chatId, file);

        fs.remove(file);
      } catch (e) {
        sendErr(e);
      }
    },

    code: async (txt) =>
      bot.sendMessage(chatId, `\`\`\`js\n${txt}\n\`\`\``, {
        parse_mode: "Markdown"
      }),

    err: sendErr
  };
}

// ================= LOAD =================
function loadScripts(bot) {
  const cmdPath = path.join(process.cwd(), "scripts", "cmds");
  const evPath = path.join(process.cwd(), "scripts", "events");

  console.log("📂 CMD PATH:", cmdPath);
  console.log("📂 EVENT PATH:", evPath);

  // CHECK EXIST
  if (!fs.existsSync(cmdPath)) {
    console.log("❌ cmds folder not found!");
    return;
  }

  if (!fs.existsSync(evPath)) {
    console.log("❌ events folder not found!");
    return;
  }

  // LOAD COMMANDS
  fs.readdirSync(cmdPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const cmd = require(path.join(cmdPath, file));

      if (!cmd.config?.name) {
        console.log("❌ Invalid command:", file);
        return;
      }

      global.commands.set(cmd.config.name, cmd);
      console.log(`✅ CMD: ${cmd.config.name}`);
    } catch (e) {
      console.log("❌ CMD Load Error:", file, e.message);
    }
  });

  // LOAD EVENTS
  fs.readdirSync(evPath).forEach(file => {
    if (!file.endsWith(".js")) return;

    try {
      const name = path.parse(file).name;
      const ev = require(path.join(evPath, file));

      const handler = (...args) => ev.run({ bot, event: args[0] });

      bot.on(name, handler);
      global.events.set(name, handler);

      console.log(`⚡ EVENT: ${name}`);
    } catch (e) {
      console.log("❌ EVENT Load Error:", file, e.message);
    }
  });

  // HOT RELOAD
  chokidar.watch([cmdPath, evPath]).on("change", (file) => {
    try {
      delete require.cache[require.resolve(file)];

      if (file.includes("cmds")) {
        const cmd = require(file);
        if (!cmd.config?.name) return;

        global.commands.set(cmd.config.name, cmd);
        console.log(`♻️ Reload CMD: ${cmd.config.name}`);
      }

      if (file.includes("events")) {
        const name = path.parse(file).name;

        bot.removeListener(name, global.events.get(name));

        const ev = require(file);
        const handler = (...args) => ev.run({ bot, event: args[0] });

        bot.on(name, handler);
        global.events.set(name, handler);

        console.log(`♻️ Reload EVENT: ${name}`);
      }
    } catch (e) {
      console.log("❌ Reload Error:", e.message);
    }
  });
}

module.exports = {
  messageUtils: message,
  loadScripts
};
