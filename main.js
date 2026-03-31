const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const colors = require('colors');

const config = require('./config.json');
const { loadScripts, messageUtils } = require('./utils');

// ================= INIT =================
const bot = new TelegramBot(config.token, { polling: true });

// Global storage
global.commands = new Map();
global.events = new Map();
global.functions = {
  reply: new Map(),
  onReply: new Map(),
  handleEvent: new Map()
};

// ================= LOAD DATABASE =================
let users = [];
let threads = [];

try {
  users = JSON.parse(fs.readFileSync('./database/users.json'));
  threads = JSON.parse(fs.readFileSync('./database/threads.json'));
  console.log("✅ Database loaded".green);
} catch (err) {
  console.log("⚠️ Database not found, using empty".yellow);
}

// ================= LOAD SCRIPTS =================
loadScripts(bot);

// ================= EXPRESS SERVER =================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Home
app.get('/', (req, res) => {
  res.send("🤖 Bot is running...");
});

// Dashboard
app.get('/dashboard', (req, res) => {
  res.json({
    botName: config.botName || "Telegram Bot",
    prefix: config.prefix,
    admin: config.adminName || "Unknown",
    totalUsers: users.length,
    totalThreads: threads.length,
    uptime: process.uptime()
  });
});

// ⚠️ FIXED (avoid port conflict)
if (!process.env.PORT) {
  app.listen(PORT, () => {
    console.log(`🌐 Server running on port ${PORT}`.cyan);
  });
}

// ================= MESSAGE (COMMAND ONLY) =================
bot.on('message', async (msg) => {
  const text = msg.text || '';
  const prefix = config.prefix;

  // Only command
  if (!text.startsWith(prefix)) return;

  const args = text.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!global.commands.has(commandName)) return;

  try {
    const command = global.commands.get(commandName);

    await command.run({
      bot,
      message: messageUtils(bot, msg),
      args,
      event: msg
    });

  } catch (err) {
    console.error(`❌ Command error (${commandName}):`, err);

    try {
      await messageUtils(bot, msg).reply("❌ Error executing command");
    } catch {}
  }
});

// ================= CALLBACK (BUTTON REPLY) =================
bot.on('callback_query', async (query) => {
  const msgId = query.message.message_id;

  if (global.functions.reply.has(msgId)) {
    const data = global.functions.reply.get(msgId);
    const command = global.commands.get(data.commandName);

    if (command?.reply) {
      try {
        await command.reply({
          bot,
          message: messageUtils(bot, query.message),
          args: query.data.split(" "),
          Reply: data,
          event: query
        });
      } catch (err) {
        console.error("❌ Reply error:", err);
      }
    }
  }
});

// ================= POLLING ERROR =================
bot.on('polling_error', (error) => {
  console.error("⚠️ Polling error:", error);
});

// ================= START LOG =================
console.log(`
==============================
🤖 Bot Started Successfully
Name   : ${config.botName}
Prefix : ${config.prefix}
==============================
`.green);
