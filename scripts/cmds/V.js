const { getStreamFromURL, uploadImgbb } = global.utils;
 
module.exports = {
	config: {
		name: "antichangeinfobox",
		version: "1.9",
		author: "NTKhang",
		cooldown: 5,
		role: 0,
		description: {
			vi: "Bật tắt chức năng chống thành viên đổi thông tin box chat của bạn",
			en: "Turn on/off anti change info box"
		},
		category: "box chat"
	},
 
	onStart: async function ({ message, event, args, threadsData }) {
		if (!["on", "off"].includes(args[1]))
			return message.reply("❌ | Invalid syntax");

		const { threadID } = event;

		const dataAntiChangeInfoBox = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

		async function checkAndSaveData(key, data) {
			if (args[1] === "off")
				delete dataAntiChangeInfoBox[key];
			else
				dataAntiChangeInfoBox[key] = data;

			await threadsData.set(threadID, dataAntiChangeInfoBox, "data.antiChangeInfoBox");

			return message.reply(`✅ | ${key} ${args[1]}`);
		}

		switch (args[0]) {
			case "avt":
			case "avatar":
			case "image": {
				const { imageSrc } = await threadsData.get(threadID) || {};
				if (!imageSrc)
					return message.reply("❌ | You have not set avatar");

				const newImageSrc = await uploadImgbb(imageSrc);
				await checkAndSaveData("avatar", newImageSrc.image.url);
				break;
			}

			case "name": {
				const { threadName } = await threadsData.get(threadID);
				await checkAndSaveData("name", threadName);
				break;
			}

			case "nickname": {
				const { members } = await threadsData.get(threadID);
				const data = members
					.map(user => ({ [user.userID]: user.nickname }))
					.reduce((a, b) => ({ ...a, ...b }), {});
				await checkAndSaveData("nickname", data);
				break;
			}

			case "theme": {
				const { threadThemeID } = await threadsData.get(threadID);
				await checkAndSaveData("theme", threadThemeID);
				break;
			}

			case "emoji": {
				const { emoji } = await threadsData.get(threadID);
				await checkAndSaveData("emoji", emoji);
				break;
			}

			default:
				return message.reply("❌ | Invalid option");
		}
	},
 
	onEvent: async function ({ message, event, threadsData, role, bot }) {
		const { threadID, logMessageType, logMessageData, author } = event;

		const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

		switch (logMessageType) {

			case "log:thread-image": {
				if (!dataAntiChange.avatar) return;

				if (role < 1 && bot.getMe().id != author) {
					if (dataAntiChange.avatar != "REMOVE") {
						message.reply("⚠️ | Anti change avatar is on");
						bot.setChatPhoto(threadID, await getStreamFromURL(dataAntiChange.avatar));
					} else {
						message.reply("⚠️ | Avatar not set");
					}
				}
				break;
			}

			case "log:thread-name": {
				if (!dataAntiChange.name) return;

				if (role < 1 && bot.getMe().id != author) {
					message.reply("⚠️ | Anti change name is on");
					bot.setChatTitle(threadID, dataAntiChange.name);
				}
				break;
			}

			case "log:user-nickname": {
				if (!dataAntiChange.nickname) return;

				const { participant_id } = logMessageData;

				if (role < 1 && bot.getMe().id != author) {
					message.reply("⚠️ | Anti change nickname is on");
					bot.setChatMemberCustomTitle(threadID, participant_id, dataAntiChange.nickname[participant_id]);
				}
				break;
			}

			case "log:thread-color": {
				if (!dataAntiChange.theme) return;

				if (role < 1 && bot.getMe().id != author) {
					message.reply("⚠️ | Anti change theme is on");
				}
				break;
			}

			case "log:thread-icon": {
				if (!dataAntiChange.emoji) return;

				if (role < 1 && bot.getMe().id != author) {
					message.reply("⚠️ | Anti change emoji is on");
				}
				break;
			}
		}
	}
};
