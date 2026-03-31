const User = require('../models/user');
const fs = require('fs');
const path = require('path');

// ✅ FIXED PATH
const dataPath = path.join(__dirname, 'users.json');

// ================= JSON SYSTEM =================
function loadJSONData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } else {
      fs.writeFileSync(dataPath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error('Error loading JSON data:', error);
    return [];
  }
}

function saveJSONData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving JSON data:', error);
  }
}

let jsonData = loadJSONData();

// ================= EXPORT =================
module.exports = {

  // CREATE
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating user:', error.message);
      return null;
    }
  },

  // GET USER
  async getUser(userId) {
    try {
      const user = await User.findOne({ userId });
      return user || null;
    } catch (error) {
      console.error('Error getting user:', error.message);
      return null;
    }
  },

  async get(userId) {
    return this.getUser(userId);
  },

  // UPDATE
  async updateUser(userId, updateData) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      );
      return updatedUser || null;
    } catch (error) {
      console.error('Error updating user:', error.message);
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
      const deletedUser = await User.findOneAndDelete({ userId });
      return deletedUser || null;
    } catch (error) {
      console.error('Error deleting user:', error.message);
      return null;
    }
  },

  async delete(userId) {
    return this.deleteUser(userId);
  },

  // GET ALL USERS 🔥 FIXED
  async getAllUsers() {
    try {
      const users = await User.find({});
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error('Error getting all users:', error.message);
      return []; // ✅ VERY IMPORTANT
    }
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
      console.error('Error getting user name:', error.message);
      return 'Telegram user';
    }
  }
};
