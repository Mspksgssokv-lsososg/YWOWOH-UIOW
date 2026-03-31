const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'users.json');

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

    return data.filter(u => u && u.userId != null);

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
  getAllUsers: () => loadJSONData(), 

  get: (userId) => {
    const data = loadJSONData();
    return data.find(u => u.userId == userId);
  },

  set: (user) => {
    const data = loadJSONData();
    const index = data.findIndex(u => u.userId == user.userId);

    if (index !== -1) {
      data[index] = { ...data[index], ...user };
    } else {
      data.push(user);
    }

    saveJSONData(data);
  },

  delete: (userId) => {
    let data = loadJSONData();
    data = data.filter(u => u.userId != userId);
    saveJSONData(data);
  }
};
