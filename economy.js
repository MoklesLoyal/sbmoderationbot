const fs = require('fs');
const path = require('path');

// Path for storing economy data
const economyPath = './data/economy.json';

// Initialize economy data
let economy = {};

// Create economy file if it doesn't exist
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

if (!fs.existsSync(economyPath)) {
    fs.writeFileSync(economyPath, '{}', 'utf8');
} else {
    economy = JSON.parse(fs.readFileSync(economyPath, 'utf8'));
}

module.exports = {
    getBalance(userId) {
        if (!economy[userId]) {
            economy[userId] = 0;
        }
        return economy[userId];
    },

    addCurrency(userId, amount) {
        if (!economy[userId]) {
            economy[userId] = 0;
        }
        economy[userId] += amount;
        this.saveData();
        return economy[userId];
    },

    removeCurrency(userId, amount) {
        if (!economy[userId]) {
            economy[userId] = 0;
        }
        economy[userId] -= amount;
        this.saveData();
        return economy[userId];
    },

    saveData() {
        fs.writeFileSync(economyPath, JSON.stringify(economy, null, 2));
    }
};
