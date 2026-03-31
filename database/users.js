const fs = require('fs');
const path = require('path');

// FILE PATH
const dataPath = path.join(__dirname, 'users.json');

// LOAD
function loadJSONData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } else {
      fs.writeFileSync(dataPath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error('Error loading JSON:', error);
    return [];
  }
}

// SAVE
function saveJSONData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving JSON:', error);
  }
}

let jsonData = loadJSONData();

// ================= EXPORT =================
module.exports = {

  // CREATE
  async createUser(userData) {
    try {
      jsonData.push(userData);
      saveJSONData(jsonData);
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  // GET USER
  async getUser(userId) {
    try {
      return jsonData.find(u => u.userId == userId) || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async get(userId) {
    return this.getUser(userId);
  },

  // UPDATE
  async updateUser(userId, updateData) {
    try {
      const index = jsonData.findIndex(u => u.userId == userId);
      if (index === -1) return null;

      jsonData[index] = {
        ...jsonData[index],
        ...updateData
      };

      saveJSONData(jsonData);
      return jsonData[index];
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  async setUser(userId, updateData) {
    return this.updateUser(userId, updateData);
  },

  async set(userId, updateData) {
    return this.updateUser(userId, updateData);
  },

  // DELETE
  async deleteUser(userId) {
    try {
      const index = jsonData.findIndex(u => u.userId == userId);
      if (index === -1) return null;

      const deleted = jsonData.splice(index, 1);
      saveJSONData(jsonData);
      return deleted[0];
    } catch (error) {
      console.error('Error deleting user:', error);
      return null;
    }
  },

  async delete(userId) {
    return this.deleteUser(userId);
  },

  // GET ALL
  async getAllUsers() {
    return jsonData;
  },

  async getAll() {
    return this.getAllUsers();
  },

  // GET NAME
  async getName(userId) {
    try {
      const user = await this.getUser(userId);
      return user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
        : 'Telegram user';
    } catch (error) {
      console.error('Error getting name:', error);
      return 'Telegram user';
    }
  }
};
