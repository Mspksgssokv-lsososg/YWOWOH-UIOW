// main.js - Bot'Bee full version
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose');

// Load config
const config = require('./config.json');

// MongoDB setup
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB error:', err));

// Global storage for replies/events
global.functions = {
    reply: new Map(),
    onReply: new Map(),
    handleEvent: new Map()
};

// Users & Threads data (can replace with real mongoose models)
global.usersData = new Map();
global.threadsData = new Map();

// Load commands from scripts/cmds
global.commands = new Map();
const commandsPath = path.join(__dirname, 'scripts', 'cmds');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const cmd = require(`./scripts/cmds/${file}`);
        global.commands.set(cmd.config.name, cmd);
        if (cmd.config.aliases) {
            cmd.config.aliases.forEach(alias => global.commands.set(alias, cmd));
        }
    }
} else {
    console.warn('⚠️ scripts/cmds folder not found. Skipping command load.');
}

// Message helpers
global.message = {
    reply: async ({ ctx, text }) => ctx.reply(text),
    stream: async ({ ctx, attachment, body }) => ctx.replyWithPhoto({ source: attachment, caption: body }),
    code: async ({ ctx, text }) => ctx.reply(`\`\`\`\n${text}\n\`\`\``, { parse_mode: 'Markdown' }),
    download: async ({ ctx, attachment, body, mimeType }) => ctx.replyWithDocument({ source: attachment, caption: body }),
    unsend: async ({ ctx, message_id }) => ctx.deleteMessage(message_id),
    err: async ({ ctx, error }) => ctx.reply(`❌ Error: ${error}`)
};

// ----------------- Core Handlers -----------------
async function handleCommand(event) {
    const text = event.text || '';
    const fromId = event.from.id;

    if (config.ignore_list_ID.enable && config.ignore_list_ID.IDS.includes(fromId)) return;
    if (config.white_list_ID.enable && !config.white_list_ID.IDS.includes(fromId)) return;

    const hasPrefix = text.startsWith(config.prefix);
    const args = hasPrefix ? text.slice(config.prefix.length).trim().split(/ +/) : text.split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!global.commands.has(commandName)) return;

    const command = global.commands.get(commandName);

    // Role check
    if (command.config.role && !config.adminBot.includes(fromId.toString()) && !config.botOperator.includes(fromId.toString())) {
        return global.message.reply({ ctx: event, text: '❌ You are not authorized!' });
    }

    try {
        await command.run({ event, message: event, args });

        // Store for reply/onReply
        const msgId = event.message_id;
        global.functions.reply.set(msgId, {
            commandName: command.config.name,
            type: 'reply',
            messageID: msgId,
            author: fromId,
            data: args
        });

    } catch (err) {
        console.error(err);
        global.message.err({ ctx: event, error: err.message });
    }
}

// ----------------- Event Handlers -----------------
async function onStart() {
    console.log('🚀 Bot started successfully.');
    global.commands.forEach(cmd => {
        if (cmd.onStart) cmd.onStart({ message, usersData, threadsData });
    });
}

async function onChat(event) {
    global.commands.forEach(cmd => {
        if (cmd.onChat) cmd.onChat({ event, message, usersData, threadsData });
    });

    await handleCommand(event);
}

// ----------------- AI / Reply Handling -----------------
async function handleReplyEvent(event) {
    const msgId = event.reply_to_message?.message_id;
    if (!msgId) return;

    let replyData = global.functions.reply.get(msgId)
        || global.functions.onReply.get(msgId)
        || global.functions.handleEvent.get(msgId);

    if (!replyData) return;

    try {
        const { commandName } = replyData;
        const command = global.commands.get(commandName);
        if (command && command.onReply) {
            await command.onReply({ event, message: event, args: event.text.split(/ +/), Reply: replyData });
        }
    } catch (err) {
        console.error(err);
        global.message.err({ ctx: event, error: err.message });
    }
}

// ----------------- Start Bot -----------------
async function startBot() {
    await onStart();
    console.log('🎯 Listening to messages...');

    // TODO: Replace this with actual Telegram client
    // Example pseudo-code:
    // telegramClient.on('message', async (event) => {
    //     await onChat(event);
    //     await handleReplyEvent(event);
    // });
}

startBot();
process.once('SIGINT', () => console.log('Bot stopped.'));
process.once('SIGTERM', () => console.log('Bot stopped.'));
