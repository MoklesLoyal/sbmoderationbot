const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to aura data file
const auraFilePath = path.join(__dirname, '..', '..', 'data', 'aura.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auramodify')
        .setDescription('Add or remove aura points from a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to modify aura for')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Amount of aura points to add (use negative to remove)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for modifying aura')
                .setRequired(false)),

    async execute(interaction) {
        // Check if user has permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ 
                content: 'You do not have permission to modify aura points.', 
                ephemeral: true 
            });
        }

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        try {
            // Load aura data
            let auraData = {};
            if (fs.existsSync(auraFilePath)) {
                auraData = JSON.parse(fs.readFileSync(auraFilePath, 'utf8'));
            } else {
                auraData = { users: {}, messageReactions: {} };
            }
            
            // Initialize user if they don't exist
            if (!auraData.users[targetUser.id]) {
                auraData.users[targetUser.id] = {
                    aura: 0,
                    positiveReactions: 0,
                    negativeReactions: 0,
                    totalMessages: 0
                };
            }
            
            // Update aura
            const oldAura = auraData.users[targetUser.id].aura;
            auraData.users[targetUser.id].aura += amount;
            
            // Update reaction counts if needed
            if (amount > 0) {
                auraData.users[targetUser.id].positiveReactions += 1;
            } else if (amount < 0) {
                auraData.users[targetUser.id].negativeReactions += 1;
            }
            
            // Save updated data
            fs.writeFileSync(auraFilePath, JSON.stringify(auraData, null, 2));
            
            // Reply with confirmation
            await interaction.reply({
                content: `Successfully modified ${targetUser.username}'s aura by ${amount} points.\n` +
                         `Old aura: ${oldAura}\n` +
                         `New aura: ${auraData.users[targetUser.id].aura}\n` +
                         `Reason: ${reason}`,
                ephemeral: false
            });
            
        } catch (error) {
            console.error('Error modifying aura:', error);
            await interaction.reply({ 
                content: 'An error occurred while modifying aura points.', 
                ephemeral: true 
            });
        }
    },
};
