const TelegramBot = require("node-telegram-bot-api");
const config = require("./config.json");
const { loadScripts, messageUtils } = require("./utils");

// ✅ DATABASE CONNECT
const usersData = require("./database/users");
const threadsData = require("./database/threads");

// INIT
const bot = new TelegramBot(config.token, { polling: true });

// GLOBAL
global.commands = new Map();
global.events = new Map();
global.functions = {
  reply: new Map(),
  onReply: new Map(),
  handleEvent: new Map()
};

// LOAD
loadScripts(bot);

// ================= MESSAGE =================
bot.on("message", async (msg) => {
  const text = msg.text || "";
  const prefix = config.prefix;

  const message = messageUtils(bot, msg);

  // ================= GLOBAL EVENTS =================
  for (let cmd of global.commands.values()) {
    try {
      if (cmd.onChat) {
        await cmd.onChat({
          bot,
          event: msg,
          message,
          usersData,
          threadsData
        });
      }

      if (cmd.handleEvent) {
        await cmd.handleEvent({
          bot,
          event: msg,
          message,
          usersData,
          threadsData
        });
      }

      if (cmd.noPrefix && !text.startsWith(prefix)) {
        await cmd.noPrefix({
          bot,
          event: msg,
          message,
          usersData,
          threadsData
        });
      }

    } catch (e) {
      console.log("❌ Global Event Error:", e);
    }
  }

  // ================= PREFIX COMMAND =================
  if (!text.startsWith(prefix)) return;

  const args = text.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

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
});

// ================= REPLY SYSTEM =================
bot.on("message", async (msg) => {
  const message = messageUtils(bot, msg);
  const msgId = msg.reply_to_message?.message_id;

  if (!msgId) return;

  // reply
  if (global.functions.reply.has(msgId)) {
    const data = global.functions.reply.get(msgId);
    const command = global.commands.get(data.commandName);

    if (command?.reply) {
      await command.reply({
        bot,
        event: msg,
        message,
        args: msg.text?.split(" ") || [],
        Reply: data,
        usersData,
        threadsData
      });
    }
  }

  // onReply
  if (global.functions.onReply.has(msgId)) {
    const data = global.functions.onReply.get(msgId);
    const command = global.commands.get(data.commandName);

    if (command?.onReply) {
      await command.onReply({
        bot,
        event: msg,
        message,
        args: msg.text?.split(" ") || [],
        Reply: data,
        usersData,
        threadsData
      });
    }
  }
});

// ================= CALLBACK =================
bot.on("callback_query", async (query) => {
  const msgId = query.message.message_id;
  const message = messageUtils(bot, query.message);

  if (global.functions.reply.has(msgId)) {
    const data = global.functions.reply.get(msgId);
    const command = global.commands.get(data.commandName);

    if (command?.reply) {
      await command.reply({
        bot,
        event: query,
        message,
        args: query.data.split(" "),
        Reply: data,
        usersData,
        threadsData
      });
    }
  }
});

// ================= START LOG =================
console.log(`
========================
🤖 BOTBEE SYSTEM READY
Prefix : ${config.prefix}
Commands : ${global.commands.size}
========================
`);
