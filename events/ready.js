const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Clean up any existing intervals when the bot restarts
        if (global.bbqIntervals) {
            for (const intervalId of global.bbqIntervals.values()) {
                clearInterval(intervalId);
            }
        }
        
        // Initialize global map for BBQ intervals
        global.bbqIntervals = new Map();
    },
};
