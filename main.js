const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const { loadScripts, messageUtils } = require("./utils");

const usersData = require("./database/users");
const threadsData = require("./database/threads");

const token = process.env.TELEGRAM_BOT_TOKEN || config.token;
const bot = new TelegramBot(token, { polling: true });

// 🌍 GLOBAL
global.commands = new Map();
global.events = new Map();

global.functions = {
  config: config,
  reply: new Map(),
  onReply: new Map()
};

// 📦 LOAD COMMANDS
loadScripts(bot);

// ================= MESSAGE =================
bot.on("message", async (msg) => {
  try {
    const text = msg.text || "";
    if (!text) return;

    const prefix = config.prefix;
    const message = messageUtils(bot, msg);

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // 🔐 BOT ADMIN
    const admins = config.admins || [];
    const isBotAdmin = admins.includes(userId);

    // 👑 BOT OPERATOR
    const operators = config.botOperator || [];
    const isOperator = operators.includes(userId);

    // 🚫 IGNORE LIST
    if (config.ignore_list_ID?.enable) {
      if (config.ignore_list_ID.IDS.includes(userId)) return;
    }

    // ✅ WHITE LIST USER
    if (config.white_list_ID?.enable) {
      if (!config.white_list_ID.IDS.includes(userId)) return;
    }

    // ✅ WHITE LIST GROUP
    if (config.white_list_group?.enable) {
      if (!config.white_list_group.groups.includes(chatId)) return;
    }

    // 👥 GROUP ADMIN CHECK
    let isAdmin = false;
    if (msg.chat.type !== "private") {
      try {
        const member = await bot.getChatMember(chatId, userId);
        isAdmin = ["administrator", "creator"].includes(member.status);
      } catch (e) {
        console.log("Admin check error:", e);
      }
    }

    // ================= GLOBAL EVENTS =================
    for (let cmd of global.commands.values()) {
      try {
        if (cmd.onChat) {
          await cmd.onChat({ bot, event: msg, msg, message, usersData, threadsData });
        }

        if (cmd.handleEvent) {
          await cmd.handleEvent({ bot, event: msg, msg, message, usersData, threadsData });
        }

        if (cmd.noPrefix && !text.startsWith(prefix)) {
          await cmd.noPrefix({ bot, event: msg, msg, message, usersData, threadsData });
        }
      } catch (e) {
        console.log("❌ Global Event Error:", e);
      }
    }

    // ================= REPLY SYSTEM =================
    const replyMsgId = msg.reply_to_message?.message_id;

    if (replyMsgId) {
      if (global.functions.reply.has(replyMsgId)) {
        const data = global.functions.reply.get(replyMsgId);
        const command = global.commands.get(data.commandName);

        if (command?.reply) {
          return await command.reply({
            bot,
            event: msg,
            msg,
            message,
            args: text.split(" "),
            Reply: data,
            usersData,
            threadsData
          });
        }
      }

      if (global.functions.onReply.has(replyMsgId)) {
        const data = global.functions.onReply.get(replyMsgId);
        const command = global.commands.get(data.commandName);

        if (command?.onReply) {
          return await command.onReply({
            bot,
            event: msg,
            msg,
            message,
            args: text.split(" "),
            Reply: data,
            usersData,
            threadsData
          });
        }
      }
    }

    // ================= COMMAND PARSE =================
    const hasPrefix = text.startsWith(prefix);

    const input = hasPrefix
      ? text.slice(prefix.length).trim()
      : text.trim();

    const args = input.split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    const command =
      global.commands.get(commandName) ||
      [...global.commands.values()].find(cmd =>
        cmd.config?.aliases?.includes(commandName)
      );

    if (!command) return;

    // ================= PREFIX CHECK =================
    if (command.config?.usePrefix !== false && !hasPrefix) return;

    // ================= ROLE SYSTEM =================
    const role = command.config?.role ?? 0;

    // 🔒 Bot Admin
    if (role === 2 && !isBotAdmin) {
      return bot.sendMessage(chatId, "⚠️ | Bot admin only command!");
    }

    // 👮 Group Admin
    if (role === 1 && !isBotAdmin && !isAdmin) {
      return bot.sendMessage(chatId, "⚠️ | Group admin only command!");
    }

    // 👑 Operator (optional role 3)
    if (role === 3 && !isBotAdmin && !isOperator) {
      return bot.sendMessage(chatId, "⚠️ | Bot operator only command!");
    }

    // ================= RUN COMMAND =================
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
      } else if (command.run) {
        await command.run({
          bot,
          event: msg,
          msg,
          args,
          message,
          usersData,
          threadsData
        });
      } else if (command.start) {
        await command.start({
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
      console.log(`❌ ${commandName}:`, err);
      message.err(err);
    }

  } catch (err) {
    console.log("❌ MAIN ERROR:", err);
  }
});

// ================= CALLBACK =================
bot.on("callback_query", async (query) => {
  try {
    if (!query.message) return;

    const msgId = query.message.message_id;
    const message = messageUtils(bot, query.message);

    if (global.functions.reply.has(msgId)) {
      const data = global.functions.reply.get(msgId);
      const command = global.commands.get(data.commandName);

      if (command?.reply) {
        return await command.reply({
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
    }

    if (global.functions.onReply.has(msgId)) {
      const data = global.functions.onReply.get(msgId);
      const command = global.commands.get(data.commandName);

      if (command?.onReply) {
        return await command.onReply({
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
    }

  } catch (err) {
    console.log("❌ CALLBACK ERROR:", err);
  }
});

// ================= START LOG =================
console.log(`
========================
🤖 BOT SYSTEM READY
Name   : ${config.botName}
Prefix : ${config.prefix}
Owner  : ${config.owner}
========================
`);
