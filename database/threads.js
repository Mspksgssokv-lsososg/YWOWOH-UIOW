const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'threads.json');

function loadJSONData() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return [];
    }

    const raw = fs.readFileSync(dataPath, 'utf-8');

    if (!raw || raw.trim() === "") return [];

    let data = JSON.parse(raw);

    if (!Array.isArray(data)) return [];

    return data.filter(t => t && t.threadId != null);

  } catch (err) {
    console.error("❌ JSON Error Fixed:", err.message);

    const backupPath = dataPath + ".backup";
    fs.copyFileSync(dataPath, backupPath);

    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
    return [];
  }
}

function saveJSONData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Save Error:", err.message);
  }
}

module.exports = {
  getAll: () => loadJSONData(),
  getAllThreads: () => loadJSONData(), 

  get: (threadId) => {
    const data = loadJSONData();
    return data.find(t => t.threadId == threadId);
  },

  set: (thread) => {
    const data = loadJSONData();
    const index = data.findIndex(t => t.threadId == thread.threadId);

    if (index !== -1) {
      data[index] = { ...data[index], ...thread };
    } else {
      data.push(thread);
    }

    saveJSONData(data);
  },

  delete: (threadId) => {
    let data = loadJSONData();
    data = data.filter(t => t.threadId != threadId);
    saveJSONData(data);
  }
};
