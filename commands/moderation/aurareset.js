const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to aura data file
const auraFilePath = path.join(__dirname, '..', '..', 'data', 'aura.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aurareset')
        .setDescription('Reset aura points for all users')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('confirmation')
                .setDescription('Type "CONFIRM" to reset all aura points')
                .setRequired(true)),

    async execute(interaction) {
        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ 
                content: 'You do not have permission to reset aura points.', 
                ephemeral: true 
            });
        }

        const confirmation = interaction.options.getString('confirmation');
        
        if (confirmation !== 'CONFIRM') {
            return await interaction.reply({ 
                content: 'Reset cancelled. You must type "CONFIRM" to proceed with the reset.', 
                ephemeral: true 
            });
        }
        
        try {
            // Load aura data
            let auraData = {};
            if (fs.existsSync(auraFilePath)) {
                auraData = JSON.parse(fs.readFileSync(auraFilePath, 'utf8'));
            } else {
                auraData = { users: {}, messageReactions: {} };
            }
            
            // Count how many users were affected
            const userCount = Object.keys(auraData.users).length;
            
            // Reset all users' aura points
            for (const userId in auraData.users) {
                auraData.users[userId].aura = 0;
                auraData.users[userId].positiveReactions = 0;
                auraData.users[userId].negativeReactions = 0;
                // Keep totalMessages intact for historical data
            }
            
            // Clear message reactions tracking
            auraData.messageReactions = {};
            
            // Save updated data
            fs.writeFileSync(auraFilePath, JSON.stringify(auraData, null, 2));
            
            // Reply with confirmation
            await interaction.reply({
                content: `✅ Successfully reset aura points for ${userCount} users.\n` +
                         `All users now have 0 aura points and reaction counts have been reset.\n` +
                         `Message counts have been preserved for historical purposes.`,
                ephemeral: false
            });
            
        } catch (error) {
            console.error('Error resetting aura:', error);
            await interaction.reply({ 
                content: 'An error occurred while resetting aura points.', 
                ephemeral: true 
            });
        }
    },
};
