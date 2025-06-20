const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { rateMessage } = require('../utils/localLlama');
const { updateUserAura } = require('../utils/auraSystem');

// Path to store reaction data
const dataPath = path.join(__dirname, '..', 'data');
const reactionsFilePath = path.join(dataPath, 'reactions.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}

// Initialize or load reactions data
function getReactionsData() {
    const defaultData = { messages: [] };
    
    if (!fs.existsSync(reactionsFilePath)) {
        fs.writeFileSync(reactionsFilePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    
    try {
        const fileContent = fs.readFileSync(reactionsFilePath, 'utf8');
        
        // Check if file is empty or contains only whitespace
        if (!fileContent.trim()) {
            console.log('Empty reactions file detected, recreating...');
            fs.writeFileSync(reactionsFilePath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error parsing reactions data:', error.message);
        console.log('Recreating corrupted reactions file...');
        
        // Backup the corrupted file
        const backupPath = reactionsFilePath + `_corrupted_${Date.now()}.bak`;
        try {
            fs.copyFileSync(reactionsFilePath, backupPath);
            console.log(`Corrupted file backed up to: ${backupPath}`);
        } catch (backupError) {
            console.error('Failed to backup corrupted file:', backupError.message);
        }
        
        // Create new file with default data
        fs.writeFileSync(reactionsFilePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

// Save reactions data
function saveReactionsData(data) {
    try {
        fs.writeFileSync(reactionsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving reactions data:', error.message);
    }
}

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        // Partial reactions need to be fetched to access their properties
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        // Get the message
        const message = reaction.message;
        if (message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error('Error fetching message:', error);
                return;
            }
        }
        
        // Skip if the message is from the bot itself
        if (message.author.bot) return;
        
        // Skip if the message content is empty (e.g., only attachments)
        if (!message.content || message.content.trim() === '') return;

        // Update aura for message author based on reaction
        // Pass messageId, authorId, reactorId, and reaction name
        updateUserAura(
            message.id, 
            message.author.id, 
            user.id, 
            reaction.emoji.name, 
            true
        );

        // Check if the message is in the target channel for AI rating
        if (message.channel.id === '374971715626991628') {
            // Load reactions data
            const reactionsData = getReactionsData();
            
            // Find if message is already in our data
            const existingMessageIndex = reactionsData.messages.findIndex(m => m.id === message.id);
            let messageData;
            
            if (existingMessageIndex !== -1) {
                // Get existing entry
                messageData = reactionsData.messages[existingMessageIndex];
                
                // Initialize reactedUsers array if it doesn't exist
                if (!messageData.reactedUsers) {
                    messageData.reactedUsers = [];
                }
                
                // Check if this user has already reacted
                if (!messageData.reactedUsers.includes(user.id)) {
                    messageData.reactedUsers.push(user.id);
                    // Update unique user reaction count
                    messageData.uniqueReactionCount = messageData.reactedUsers.length;
                }
            } else {
                // Create new entry
                messageData = {
                    id: message.id,
                    content: message.content,
                    author: message.author.tag,
                    authorId: message.author.id,
                    timestamp: message.createdTimestamp,
                    reactionCount: 0, // Keep this for backward compatibility
                    uniqueReactionCount: 1, // Start with 1 for the current user
                    reactedUsers: [user.id], // Track users who reacted
                    rated: false
                };
                reactionsData.messages.push(messageData);
            }
            
            // Update total reaction count (for backward compatibility)
            let totalReactions = 0;
            message.reactions.cache.forEach(reaction => {
                totalReactions += reaction.count;
            });
            messageData.reactionCount = totalReactions;
            
            // Save updated data
            saveReactionsData(reactionsData);
            
            // Check if message has 10+ unique user reactions and hasn't been rated yet
            if (messageData.uniqueReactionCount >= 10 && !messageData.rated) {
                // Rate the message with local Llama model
                const rating = await rateMessage(message.content);
                
                // Send the rating
                await message.channel.send(`**AI Rating for ${message.author}'s message:**\n> ${message.content}\n${rating}`);
                
                // Mark as rated to prevent multiple ratings
                messageData.rated = true;
                saveReactionsData(reactionsData);
            }
        }
    },
};
