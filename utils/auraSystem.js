const fs = require('fs');
const path = require('path');

// Path to store aura data
const dataPath = path.join(__dirname, '..', 'data');
const auraFilePath = path.join(dataPath, 'aura.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

// Initialize or load aura data
function getAuraData() {
    if (!fs.existsSync(auraFilePath)) {
        const defaultData = { 
            users: {},
            messageReactions: {} // Track which users reacted to which messages
        };
        fs.writeFileSync(auraFilePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    
    try {
        const data = fs.readFileSync(auraFilePath, 'utf8');
        if (data.trim()) {
            return JSON.parse(data);
        } else {
            // File is empty, initialize with default data
            const defaultData = { 
                users: {},
                messageReactions: {}
            };
            fs.writeFileSync(auraFilePath, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
    } catch (error) {
        console.error('Error parsing aura.json, creating new file:', error.message);
        const defaultData = { 
            users: {},
            messageReactions: {}
        };
        fs.writeFileSync(auraFilePath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

// Save aura data
function saveAuraData(data) {
    try {
        fs.writeFileSync(auraFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving aura data:', error.message);
    }
}

// Define reaction values
const reactionValues = {
    // Positive reactions
    '👍': 1,      // thumbs up
    '❤️': 2,      // heart
    '🔥': 2,      // fire
    '💯': 3,      // 100
    '⭐': 2,      // star
    '🌟': 5,      // glowing star
    '😂': 1,      // joy
    '🤣': 1,      // rofl
    '👏': 2,      // clap
    '🎉': 2,      // party popper
    
    // Negative reactions
    '🤡': -3,     // clown
    '👎': -1,     // thumbs down
    '💩': -5,     // poop
    '🗑️': -3,     // wastebasket
    '🤦': -1,     // facepalm
};

// Update user aura based on reaction
function updateUserAura(messageId, authorId, reactorId, reactionName, isAdd = true) {
    const auraData = getAuraData();
    
    // Initialize messageReactions if it doesn't exist
    if (!auraData.messageReactions) {
        auraData.messageReactions = {};
    }
    
    // Initialize user if they don't exist
    if (!auraData.users[authorId]) {
        auraData.users[authorId] = {
            aura: 0,
            positiveReactions: 0,
            negativeReactions: 0,
            totalMessages: 0
        };
    }
    
    // Initialize message reactions tracking if it doesn't exist
    if (!auraData.messageReactions[messageId]) {
        auraData.messageReactions[messageId] = {};
    }
    
    // Get aura value for this reaction
    let auraValue = reactionValues[reactionName] || 0;
    
    // Check if this is a new reaction from this user for this message
    const userPreviousReaction = auraData.messageReactions[messageId][reactorId];
    
    if (isAdd) {
        // Adding a reaction
        if (userPreviousReaction) {
            // User already reacted to this message
            // If it's the same reaction, do nothing
            if (userPreviousReaction === reactionName) {
                return auraData.users[authorId];
            }
            
            // Different reaction - remove the effect of the previous one
            const previousValue = reactionValues[userPreviousReaction] || 0;
            auraData.users[authorId].aura -= previousValue;
            
            // Update reaction counts
            if (previousValue > 0) {
                auraData.users[authorId].positiveReactions--;
            } else if (previousValue < 0) {
                auraData.users[authorId].negativeReactions--;
            }
        }
        
        // Add the new reaction's effect
        auraData.users[authorId].aura += auraValue;
        
        // Update reaction counts
        if (auraValue > 0) {
            auraData.users[authorId].positiveReactions++;
        } else if (auraValue < 0) {
            auraData.users[authorId].negativeReactions++;
        }
        
        // Store this user's reaction for this message
        auraData.messageReactions[messageId][reactorId] = reactionName;
    } else {
        // Removing a reaction
        if (userPreviousReaction === reactionName) {
            // Remove the effect of this reaction
            auraData.users[authorId].aura -= auraValue;
            
            // Update reaction counts
            if (auraValue > 0) {
                auraData.users[authorId].positiveReactions--;
            } else if (auraValue < 0) {
                auraData.users[authorId].negativeReactions--;
            }
            
            // Remove this user's reaction for this message
            delete auraData.messageReactions[messageId][reactorId];
            
            // If no more reactions for this message, clean up
            if (Object.keys(auraData.messageReactions[messageId]).length === 0) {
                delete auraData.messageReactions[messageId];
            }
        }
    }
    
    // Save updated data
    saveAuraData(auraData);
    
    return auraData.users[authorId];
}

// Increment message count for user
function incrementUserMessages(userId) {
    const auraData = getAuraData();
    
    // Initialize user if they don't exist
    if (!auraData.users[userId]) {
        auraData.users[userId] = {
            aura: 0,
            positiveReactions: 0,
            negativeReactions: 0,
            totalMessages: 0
        };
    }
    
    // Increment message count
    auraData.users[userId].totalMessages++;
    
    // Save updated data
    saveAuraData(auraData);
}

// Get sorted aura leaderboard
function getAuraLeaderboard(ascending = false) {
    const auraData = getAuraData();
    
    // Convert users object to array
    const usersArray = Object.entries(auraData.users).map(([id, data]) => ({
        id,
        ...data
    }));
    
    // Sort by aura (ascending or descending)
    return usersArray.sort((a, b) => {
        return ascending ? a.aura - b.aura : b.aura - a.aura;
    });
}

module.exports = {
    getAuraData,
    updateUserAura,
    incrementUserMessages,
    getAuraLeaderboard
};
