const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../users');

// Define the latest data structure
const defaultData = {
    balance: 0,
    xp: 0,
    level: 1,
    messageCount: 0,
    lastDaily: null,
    inventory: [],
    achievements: [],
    // Add new fields here as needed
};

// Create users directory if it doesn't exist
if (!fs.existsSync(usersPath)) {
    fs.mkdirSync(usersPath);
}

function getUserData(userId) {
    const userPath = path.join(usersPath, `${userId}.json`);
    
    if (!fs.existsSync(userPath)) {
        fs.writeFileSync(userPath, JSON.stringify(defaultData, null, 2));
        return { ...defaultData };
    }

    const userData = JSON.parse(fs.readFileSync(userPath, 'utf8'));
    const updatedData = { ...defaultData, ...userData };
    
    // If new fields were added, save the updated data
    if (Object.keys(updatedData).length !== Object.keys(userData).length) {
        saveUserData(userId, updatedData);
    }
    
    return updatedData;
}

function saveUserData(userId, data) {
    const userPath = path.join(usersPath, `${userId}.json`);
    fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
}

module.exports = {
    getUserData,
    saveUserData
};