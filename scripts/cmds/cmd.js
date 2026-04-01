const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function isURL(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

function getDomain(url) {
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/i);
    return match ? match[1] : null;
}

module.exports = {
    config: {
        name: "cmd",
        version: "1.0.1",
        author: "SK-SIDDIK-KHAN (fixed)",
        countDown: 5,
        role: 3,
        category: "owner",
        usePrefix: true
    },

    onStart: async function ({ sock, chatId, args, event, getLang, prefix }) {
        const commandPath = path.join(process.cwd(), "scripts", "cmds");
        const commands = global.NixBot.commands;
        const events = global.NixBot.eventCommands;

        if (!args[0]) {
            return sock.sendMessage(chatId, { text: "⚠️ | Invalid syntax" }, { quoted: event });
        }

        const subCmd = args[0].toLowerCase();

        // ================= LOAD =================
        if (subCmd === "load") {
            const list = args.slice(1);
            if (list.length === 0) {
                return sock.sendMessage(chatId, { text: "⚠️ | Enter command name" }, { quoted: event });
            }

            const success = [];
            const failed = [];

            for (let fileName of list) {
                if (!fileName.endsWith(".js")) fileName += ".js";
                const filePath = path.join(commandPath, fileName);

                if (!fs.existsSync(filePath)) {
                    failed.push(`${fileName} => Not found`);
                    continue;
                }

                try {
                    const fullPath = require.resolve(filePath);

                    // remove old
                    if (require.cache[fullPath]) {
                        const old = require(fullPath);
                        if (old?.config?.name) {
                            commands.delete(old.config.name);
                            if (old.config.aliases) {
                                for (const a of old.config.aliases) {
                                    commands.delete(a);
                                    global.NixBot.aliases.delete(a);
                                }
                            }
                            const i = events.findIndex(e => e.config?.name === old.config.name);
                            if (i !== -1) events.splice(i, 1);
                        }
                    }

                    delete require.cache[fullPath];
                    const cmd = require(fullPath);

                    if (!cmd?.config?.name) {
                        failed.push(`${fileName} => Invalid config`);
                        continue;
                    }

                    commands.set(cmd.config.name, cmd);

                    if (cmd.config.aliases) {
                        for (const a of cmd.config.aliases) {
                            commands.set(a, cmd);
                            global.NixBot.aliases.set(a, cmd.config.name);
                        }
                    }

                    if (["onChat","onEvent","onReply","onReaction","onCall"].some(fn => typeof cmd[fn] === "function")) {
                        events.push(cmd);
                    }

                    success.push(cmd.config.name);

                } catch (e) {
                    failed.push(`${fileName} => ${e.message}`);
                }
            }

            return sock.sendMessage(chatId, {
                text:
                    `✅ Loaded: ${success.length}\n` +
                    (failed.length ? `❌ Failed: ${failed.length}\n${failed.join("\n")}` : "")
            }, { quoted: event });
        }

        // ================= LOAD ALL =================
        if (subCmd === "loadall") {
            const files = fs.readdirSync(commandPath).filter(f => f.endsWith(".js"));
            let ok = 0, fail = 0;

            for (const file of files) {
                try {
                    const fullPath = require.resolve(path.join(commandPath, file));
                    delete require.cache[fullPath];
                    const cmd = require(fullPath);
                    if (cmd?.config?.name) {
                        commands.set(cmd.config.name, cmd);
                        ok++;
                    } else fail++;
                } catch {
                    fail++;
                }
            }

            return sock.sendMessage(chatId, {
                text: `✅ Loaded: ${ok}\n❌ Failed: ${fail}`
            }, { quoted: event });
        }

        // ================= UNLOAD =================
        if (subCmd === "unload") {
            const name = args[1];
            if (!name) {
                return sock.sendMessage(chatId, { text: "⚠️ | Enter command name" }, { quoted: event });
            }

            const cmd = commands.get(name);
            if (!cmd) {
                return sock.sendMessage(chatId, { text: "❌ | Command not found" }, { quoted: event });
            }

            const configName = cmd.config?.name;

            if (cmd.config?.aliases) {
                for (const a of cmd.config.aliases) {
                    commands.delete(a);
                    global.NixBot.aliases.delete(a);
                }
            }

            commands.delete(configName);

            const i = events.findIndex(e => e.config?.name === configName);
            if (i !== -1) events.splice(i, 1);

            return sock.sendMessage(chatId, {
                text: `✅ | Unloaded "${configName}"`
            }, { quoted: event });
        }

        // ================= INSTALL =================
        if (subCmd === "install") {
            let url = args[1];
            let fileName = args[2];

            if (!url) {
                return sock.sendMessage(chatId, {
                    text: "⚠️ | Usage: cmd install <url> <name.js>"
                }, { quoted: event });
            }

            let rawCode;

            if (isURL(url)) {
                if (!fileName || !fileName.endsWith(".js")) {
                    return sock.sendMessage(chatId, { text: "⚠️ | File name must be .js" }, { quoted: event });
                }

                try {
                    if (url.includes("github.com")) {
                        url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
                    }

                    const res = await axios.get(url);
                    rawCode = res.data;
                } catch (e) {
                    return sock.sendMessage(chatId, {
                        text: `❌ | Download failed\n${e.message}`
                    }, { quoted: event });
                }
            } else {
                return sock.sendMessage(chatId, {
                    text: "⚠️ | Invalid URL"
                }, { quoted: event });
            }

            const filePath = path.join(commandPath, fileName);

            try {
                fs.writeFileSync(filePath, rawCode);

                const fullPath = require.resolve(filePath);
                delete require.cache[fullPath];

                const cmd = require(fullPath);

                if (!cmd?.config?.name) {
                    return sock.sendMessage(chatId, {
                        text: "❌ | Invalid command file"
                    }, { quoted: event });
                }

                commands.set(cmd.config.name, cmd);

                return sock.sendMessage(chatId, {
                    text: `✅ | Installed "${cmd.config.name}"`
                }, { quoted: event });

            } catch (e) {
                return sock.sendMessage(chatId, {
                    text: `❌ | Install error\n${e.message}`
                }, { quoted: event });
            }
        }

        return sock.sendMessage(chatId, {
            text: "⚠️ | Invalid command"
        }, { quoted: event });
    }
};
