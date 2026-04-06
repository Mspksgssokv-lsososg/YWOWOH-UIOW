const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");
const ffmpeg = require("ffmpeg-static");
const { createCanvas, loadImage } = require("canvas");
const { v4: uuidv4 } = require("uuid");

const cacheFolder = path.join(__dirname, "Siddik");
if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

const templates = {
  1: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720460590331-106.mp4",
    imagePosition: { x: 434, y: 120, width: 495, height: 495, curvature: 30 }
  },
  2: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720544714048-1.mp4",
    imagePosition: { x: 35, y: 492, width: 500, height: 650, curvature: 30 }
  },
  3: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720546638190-417.mp4",
    curvedImagePosition: { x: 45, y: 370, width: 630, height: 830, curvature: 30 },
    circularImagePosition: { x: 355, y: 18, size: 350 }
  },
  4: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720550953048-168.mp4",
    imagePosition: { x: 480, y: 15, width: 450, height: 700, curvature: 25 }
  },
  5: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720552135256-431.mp4",
    imagePosition: { x: 550, y: 120, width: 380, height: 490, curvature: 30 }
  },
  6: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720605734019-176.mp4",
    imagePosition: { x: 35, y: 760, width: 290, height: 400, curvature: 10 }
  },
  7: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720606729322-430.mp4",
    imagePosition: { x: 50, y: 200, width: 350, height: 350, curvature: 40 }
  },
  8: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720607303782-196.mp4",
    imagePosition: { x: 320, y: 465, width: 350, height: 350, curvature: 40 }
  },
  9: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720609537400-282.mp4",
    imagePosition: { x: 95, y: 95, width: 520, height: 580, curvature: 10 }
  },
  10: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720610455191-118.mp4",
    imagePosition: { x: 57, y: 735, width: 610, height: 480, curvature: 10 }
  },
  11: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720611205416-924.mp4",
    imagePosition: { x: 36, y: 150, width: 500, height: 680, curvature: 10 }
  },
  12: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720612689939-910.mp4",
    imagePosition: { x: 55, y: 395, width: 620, height: 765, curvature: 10 }
  },
  13: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720614082736-314.mp4",
    curvedImagePosition: { x: 90, y: 480, width: 550, height: 700, curvature: 80 },
    circularImagePosition: { x: 355, y: 18, size: 300 }
  },
  14: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720614943351-759.mp4",
    imagePosition: { x: 79, y: 110, width: 560, height: 700, curvature: 10 }
  },
  15: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720615837449-553.mp4",
    imagePosition: { x: 100, y: 200, width: 500, height: 500, curvature: 40 }
  },
  16: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720616152042-883.mp4",
    imagePosition: { x: 85, y: 200, width: 550, height: 730, curvature: 10 }
  },
  17: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720617043224-284.mp4",
    imagePosition: { x: 0, y: 195, width: 730, height: 740, curvature: 10 }
  },
  18: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720617677923-981.mp4",
    imagePosition: { x: 200, y: 125, width: 500, height: 650, curvature: 50 }
  },
  19: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720618736417-945.mp4",
    imagePosition: { x: 0, y: 385, width: 390, height: 520, curvature: 10 }
  },
  20: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720619640056-719.mp4",
    imagePosition: { x: 43, y: 65, width: 445, height: 590, curvature: 10 }
  },
  21: {
    videoUrl: "https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720620191172-593.mp4",
    imagePosition: { x: 180, y: 0, width: 510, height: 570, curvature: 10 }
  }
};

async function downloadFile(url, filePath) {
  const res = await axios({ url, responseType: "stream" });
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    res.data.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

async function createRoundedImage(input, output, pos) {
  const { width, height, curvature } = pos;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const img = await loadImage(input);

  ctx.beginPath();
  ctx.moveTo(curvature, 0);
  ctx.lineTo(width - curvature, 0);
  ctx.quadraticCurveTo(width, 0, width, curvature);
  ctx.lineTo(width, height - curvature);
  ctx.quadraticCurveTo(width, height, width - curvature, height);
  ctx.lineTo(curvature, height);
  ctx.quadraticCurveTo(0, height, 0, height - curvature);
  ctx.lineTo(0, curvature);
  ctx.quadraticCurveTo(0, 0, curvature, 0);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, 0, 0, width, height);
  fs.writeFileSync(output, canvas.toBuffer());
}

async function createCircularImage(input, output, pos) {
  const size = pos.size;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const img = await loadImage(input);

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, 0, 0, size, size);
  fs.writeFileSync(output, canvas.toBuffer());
}

module.exports = {
  config: {
    name: "sk",
    version: "1.5.5",
    author: "SK-SIDDIK-KHAN",
    countDown: 5,
    role: 0,
    usePrefix: false,
    category: "video"
  },

  onStart: async function ({ bot, msg, args, message }) {
    try {
      const chatId = msg.chat.id;

      const num = parseInt(args[0]);

if (!args[0]) {
  return message.reply("📸 Reply to image\nUse: /sk 1-21");
}

if (isNaN(num) || !templates[num]) {
  return message.reply("❌ Template not found");
}

      if (!msg.reply_to_message || !msg.reply_to_message.photo)
        return message.reply("❌ Reply to an image");

      const loadingMsg = await bot.sendMessage(chatId, "⏳ Processing Your Video...");

      const template = templates[num];

      const videoPath = path.join(cacheFolder, uuidv4() + ".mp4");
      const img1 = path.join(cacheFolder, uuidv4() + ".png");
      const img2 = path.join(cacheFolder, uuidv4() + ".png");

      await downloadFile(template.videoUrl, videoPath);

      if (num === 3) {
        const photos = msg.reply_to_message.photo;

        const file1 = await bot.getFileLink(photos.at(-1).file_id);
        const file2 = await bot.getFileLink(photos.at(-2).file_id);

        await downloadFile(file1, img1);
        await downloadFile(file2, img2);

        const r = path.join(cacheFolder, uuidv4() + ".png");
        const c = path.join(cacheFolder, uuidv4() + ".png");

        await createRoundedImage(img1, r, template.curvedImagePosition);
        await createCircularImage(img2, c, template.circularImagePosition);

        const out = path.join(cacheFolder, uuidv4() + ".mp4");

        exec(`${ffmpeg} -i "${videoPath}" -i "${r}" -i "${c}" -filter_complex "[1:v]scale=${template.curvedImagePosition.width}:${template.curvedImagePosition.height}[a];[0:v][a]overlay=${template.curvedImagePosition.x}:${template.curvedImagePosition.y}[b];[2:v]scale=${template.circularImagePosition.size}:${template.circularImagePosition.size}[c];[b][c]overlay=${template.circularImagePosition.x}:${template.circularImagePosition.y}" -pix_fmt yuv420p "${out}"`,
        err => {
          bot.deleteMessage(chatId, loadingMsg.message_id);

          if (err) return message.reply("❌ Error");

          bot.sendVideo(chatId, fs.createReadStream(out), {
            caption: "✅ | Here's Your Video"
          });
        });

      } else {
        const photo = msg.reply_to_message.photo.at(-1);
        const file = await bot.getFileLink(photo.file_id);

        await downloadFile(file, img1);

        const r = path.join(cacheFolder, uuidv4() + ".png");
        await createRoundedImage(img1, r, template.imagePosition);

        const out = path.join(cacheFolder, uuidv4() + ".mp4");

        exec(`${ffmpeg} -i "${videoPath}" -i "${r}" -filter_complex "[1:v]scale=${template.imagePosition.width}:${template.imagePosition.height}[a];[0:v][a]overlay=${template.imagePosition.x}:${template.imagePosition.y}" -pix_fmt yuv420p "${out}"`,
        err => {
          bot.deleteMessage(chatId, loadingMsg.message_id);

          if (err) return message.reply("❌ Error");

          bot.sendVideo(chatId, fs.createReadStream(out), {
            caption: "✅ | Here's Your Video "
          });
        });
      }

    } catch (e) {
      console.error(e);
      message.reply("❌ Error occurred");
    }
  }
};
 
