const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const { loadScripts, messageUtils } = require("./utils");

const fs = require("fs");
const path = require("path");

const utils = require("./utils");
global.utils = utils;

const usersData = require("./database/users");
const threadsData = require("./database/threads");

const token = process.env.TELEGRAM_BOT_TOKEN || config.token;
const bot = new TelegramBot(token, { polling: true });

// ================= REACT UNSEND TRACK =================
const botMessages = new Set();

// সব bot message track
const oldSendMessage = bot.sendMessage.bind(bot);
bot.sendMessage = async function (chatId, text, options = {}) {
  try {
    const msg = await oldSendMessage(chatId, text, options);
    if (msg?.message_id) {
      botMessages.add(msg.message_id);
      console.log("📩 Bot message:", msg.message_id);
    }
    return msg;
  } catch (e) {
    console.log("SEND ERROR:", e);
  }
};

// ================= GLOBAL =================
global.commands = new Map();
global.events = new Map();
global.config = config;
global.adminOnly = false;

global.functions = {
  reply: new Map(),
  onReply: new Map()
};

global.cooldowns = new Map();
global.firstChatUsers = new Set();

loadScripts(bot);

// ================= FILE =================
const threadFile = path.join(process.cwd(), "threads.json");
const banFile = path.join(process.cwd(), "banned.json");

if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, "[]");
if (!fs.existsSync(threadFile)) fs.writeFileSync(threadFile, "[]");

function getBanned() {
  try {
    return JSON.parse(fs.readFileSync(banFile));
  } catch {
    return [];
  }
}

function isBanned(userId) {
  return getBanned().includes(String(userId));
}

function saveThread(chatId) {
  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(threadFile));
  } catch {}

  if (!data.includes(chatId)) {
    data.push(chatId);
    fs.writeFileSync(threadFile, JSON.stringify(data));
  }
}

// ================= MESSAGE =================
bot.on("message", async (msg) => {
  try {
    const text = msg.text?.trim() || "";
    if (!text) return;

    const prefix = config.prefix;
    const message = messageUtils(bot, msg);

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const isBotAdmin = (config.admins || []).includes(userId);

    if (isBanned(userId)) {
      return bot.sendMessage(chatId, "🚫 | You are banned");
    }

    if (global.adminOnly && !isBotAdmin) {
      return bot.sendMessage(chatId, "🔒 | Admin only mode");
    }

    saveThread(chatId);

    // FIRST CHAT
    if (!global.firstChatUsers.has(userId)) {
      global.firstChatUsers.add(userId);
      for (let cmd of global.commands.values()) {
        try {
          if (cmd.onFirstChat) {
            await cmd.onFirstChat({ bot, event: msg, msg, message, usersData, threadsData });
          }
        } catch (e) {
          console.log("FIRST CHAT ERROR:", e);
        }
      }
    }

    let commandName, args;

    if (text.startsWith(prefix)) {
      args = text.slice(prefix.length).trim().split(/ +/);
      commandName = args.shift()?.toLowerCase();
    } else {
      args = text.split(/ +/);
      commandName = args.shift()?.toLowerCase();
    }

    const command =
      global.commands.get(commandName) ||
      [...global.commands.values()].find(cmd =>
        cmd.config?.aliases?.includes(commandName)
      );

    if (!command) return;

    try {
      if (command.onStart) {
        await command.onStart({
          bot,
          event: msg,
          msg,
          args,
          message,
          usersData,
          threadsData
        });
      }
    } catch (err) {
      console.log("COMMAND ERROR:", err);
    }

  } catch (err) {
    console.log("MAIN ERROR:", err);
  }
});

// ================= REACTION (FINAL FIXED) =================
bot.on("message_reaction", async (reaction) => {
  try {
    console.log("🔥 REACTION EVENT:", reaction);

    if (!reaction || !reaction.message_id || !reaction.chat) return;

    const messageId = reaction.message_id;
    const chatId = reaction.chat.id;
    const userId = reaction.user?.id || reaction.from?.id;

    if (!userId) return;

    console.log("👤 User:", userId);
    console.log("💬 Message:", messageId);

    // bot message না হলে skip
    if (!botMessages.has(messageId)) {
      console.log("❌ Not bot message");
      return;
    }

    // admin না হলে skip
    if (!config.admins?.includes(userId)) {
      console.log("❌ Not admin");
      return;
    }

    const reacts = reaction.new_reaction || [];

    for (let r of reacts) {
      if (r.type !== "emoji") continue;

      console.log("😀 Emoji:", r.emoji);

      if (config.reactUnsend?.includes(r.emoji)) {
        console.log("✅ MATCH → DELETE");

        await bot.deleteMessage(chatId, messageId);
        botMessages.delete(messageId);
        return;
      }
    }

  } catch (e) {
    console.log("REACTION ERROR:", e);
  }
});

// ================= CALLBACK =================
bot.on("callback_query", async (query) => {
  try {
    if (!query.message) return;

    const msgId = query.message.message_id;
    const message = messageUtils(bot, query.message);

    const data =
      global.functions.reply.get(msgId) ||
      global.functions.onReply.get(msgId);

    if (!data) return;

    const command = global.commands.get(data.commandName);

    if (command?.onReply) {
      await command.onReply({
        bot,
        event: query,
        msg: query.message,
        message,
        args: query.data?.split(" ") || [],
        Reply: data,
        usersData,
        threadsData
      });
    }

  } catch (err) {
    console.log("CALLBACK ERROR:", err);
  }
});

// ================= ERROR =================
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED:", err);
});

process.on("uncaughtException", (err) => {
  console.log("CRASH:", err);
});

console.log("✅ BOT READY");
