// main.js - Bot'Bee v1.0.0 complete
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

// Users & Threads data (mock, replace with mongoose models if needed)
global.usersData = new Map();
global.threadsData = new Map();

// Load commands
global.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const cmd = require(`./commands/${file}`);
    global.commands.set(cmd.config.name, cmd);
    if (cmd.config.aliases) {
        cmd.config.aliases.forEach(alias => global.commands.set(alias, cmd));
    }
}

// Message helper functions
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

    // Ignore list
    if (config.ignore_list_ID.enable && config.ignore_list_ID.IDS.includes(fromId)) return;

    // Whitelist ID
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
    // Run any startup commands
    global.commands.forEach(cmd => {
        if (cmd.onStart) cmd.onStart({ message, usersData, threadsData });
    });
}

async function onChat(event) {
    // Run all onChat events in commands
    global.commands.forEach(cmd => {
        if (cmd.onChat) cmd.onChat({ event, message, usersData, threadsData });
    });

    // Handle commands
    await handleCommand(event);
}

// ----------------- AI / Reply Handling -----------------

async function handleReplyEvent(event) {
    const msgId = event.reply_to_message?.message_id;
    if (!msgId) return;

    // Check in reply/onReply/handleEvent
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

    // Replace below with actual Telegram API event listener
    // Example pseudo-code:
    // telegramClient.on('message', async (event) => {
    //     await onChat(event);
    //     await handleReplyEvent(event);
    // });
}

startBot();

// Graceful shutdown
process.once('SIGINT', () => console.log('Bot stopped.'));
process.once('SIGTERM', () => console.log('Bot stopped.'));
