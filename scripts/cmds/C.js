const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { createCanvas, loadImage } = require('Siddik');
const { v4: uuidv4 } = require('uuid');

const cacheFolder = path.join(__dirname, 'cache');

// নিশ্চিত cache folder আছে
if (!fs.existsSync(cacheFolder)) {
  fs.mkdirSync(cacheFolder);
}

// ========= TEMPLATE =========
const templates = {
  1: {
    videoUrl: 'https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720460590331-106.mp4',
    imagePosition: { x: 434, y: 120, width: 495, height: 495, curvature: 30 }
  },
  2: {
    videoUrl: 'https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720544714048-1.mp4',
    imagePosition: { x: 35, y: 492, width: 500, height: 650, curvature: 30 }
  },
  3: {
    videoUrl: 'https://raw.githubusercontent.com/zoro-77/video-hosting/main/cache/video-1720546638190-417.mp4',
    curvedImagePosition: { x: 45, y: 370, width: 630, height: 830, curvature: 30 },
    circularImagePosition: { x: 355, y: 18, size: 350 }
  }
};

// ========= MAIN =========
module.exports = {
  config: {
    name: "sk",
    version: "2.0",
    author: "SK-SIDDIK-KHAN",
    usePrefix: false,
    category: "video",
    guide: "{p}sk <templateNumber> (reply image)"
  },

  onStart: async function ({ message, event, args }) {
    try {
      message.reply("⏳ Processing...");

      const templateNumber = parseInt(args[0]);
      if (!templates[templateNumber]) {
        return message.reply("❌ Invalid template!");
      }

      const template = templates[templateNumber];

      // ========= CHECK REPLY =========
      if (!event.messageReply || !event.messageReply.attachments) {
        return message.reply("❌ Reply to image required!");
      }

      const attachments = event.messageReply.attachments;

      // ========= DOWNLOAD VIDEO =========
      const videoPath = path.join(cacheFolder, `${uuidv4()}.mp4`);
      await downloadFile(template.videoUrl, videoPath);

      const duration = await getVideoDuration(videoPath);

      let output = path.join(cacheFolder, `${uuidv4()}.mp4`);

      // ========= TEMPLATE 3 (2 IMAGE) =========
      if (templateNumber === 3) {
        if (attachments.length < 2) {
          return message.reply("❌ Need 2 images!");
        }

        const img1 = path.join(cacheFolder, `${uuidv4()}.png`);
        const img2 = path.join(cacheFolder, `${uuidv4()}.png`);

        await downloadFile(attachments[0].url, img1);
        await downloadFile(attachments[1].url, img2);

        const rounded = path.join(cacheFolder, `${uuidv4()}.png`);
        const circle = path.join(cacheFolder, `${uuidv4()}.png`);

        await createRoundedImage(img1, rounded, template.curvedImagePosition);
        await createCircularImage(img2, circle, template.circularImagePosition);

        const cmd = `"${ffmpeg}" -i "${videoPath}" -i "${rounded}" -i "${circle}" -filter_complex "[1:v]scale=${template.curvedImagePosition.width}:${template.curvedImagePosition.height}[a];[0:v][a]overlay=${template.curvedImagePosition.x}:${template.curvedImagePosition.y}:enable='between(t,0,${duration})'[tmp];[2:v]scale=${template.circularImagePosition.size}:${template.circularImagePosition.size}[b];[tmp][b]overlay=${template.circularImagePosition.x}:${template.circularImagePosition.y}" -pix_fmt yuv420p "${output}"`;

        await runFFmpeg(cmd);

        clean([videoPath, img1, img2, rounded, circle]);
      }

      // ========= NORMAL =========
      else {
        const img = path.join(cacheFolder, `${uuidv4()}.png`);
        await downloadFile(attachments[0].url, img);

        const rounded = path.join(cacheFolder, `${uuidv4()}.png`);
        await createRoundedImage(img, rounded, template.imagePosition);

        const cmd = `"${ffmpeg}" -i "${videoPath}" -i "${rounded}" -filter_complex "[1:v]scale=${template.imagePosition.width}:${template.imagePosition.height}[a];[0:v][a]overlay=${template.imagePosition.x}:${template.imagePosition.y}:enable='between(t,0,${duration})'" -pix_fmt yuv420p "${output}"`;

        await runFFmpeg(cmd);

        clean([videoPath, img, rounded]);
      }

      // ========= SEND =========
      await message.reply({
        attachment: fs.createReadStream(output)
      });

      // delete output after send
      setTimeout(() => {
        try { fs.unlinkSync(output); } catch {}
      }, 15000);

    } catch (err) {
      console.log("❌ ERROR:", err);
      message.reply("❌ Processing failed!");
    }
  }
};

// ========= FUNCTIONS =========

async function downloadFile(url, pathFile) {
  const res = await axios({ url, responseType: 'stream' });
  const writer = fs.createWriteStream(pathFile);
  res.data.pipe(writer);

  return new Promise((res, rej) => {
    writer.on('finish', res);
    writer.on('error', rej);
  });
}

function runFFmpeg(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function getVideoDuration(video) {
  return new Promise((resolve, reject) => {
    exec(`${ffmpeg} -i "${video}"`, (err, stdout, stderr) => {
      const match = stderr.match(/Duration: (\d+):(\d+):(\d+)/);
      if (!match) return reject("No duration");

      const sec = (+match[1]) * 3600 + (+match[2]) * 60 + (+match[3]);
      resolve(sec);
    });
  });
}

function clean(files) {
  files.forEach(f => {
    try { fs.unlinkSync(f); } catch {}
  });
}

async function createRoundedImage(input, output, pos) {
  const canvas = createCanvas(pos.width, pos.height);
  const ctx = canvas.getContext('2d');
  const img = await loadImage(input);

  ctx.beginPath();
  ctx.roundRect(0, 0, pos.width, pos.height, pos.curvature);
  ctx.clip();

  ctx.drawImage(img, 0, 0, pos.width, pos.height);

  fs.writeFileSync(output, canvas.toBuffer());
}

async function createCircularImage(input, output, pos) {
  const canvas = createCanvas(pos.size, pos.size);
  const ctx = canvas.getContext('2d');
  const img = await loadImage(input);

  ctx.beginPath();
  ctx.arc(pos.size/2, pos.size/2, pos.size/2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(img, 0, 0, pos.size, pos.size);

  fs.writeFileSync(output, canvas.toBuffer());
}
