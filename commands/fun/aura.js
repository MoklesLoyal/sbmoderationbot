const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAuraData } = require('../../utils/auraSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aura')
        .setDescription('Check your aura points or another user\'s aura')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check (default: yourself)')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const auraData = getAuraData();
        
        // Get user data or create default
        const userData = auraData.users[targetUser.id] || {
            aura: 0,
            positiveReactions: 0,
            negativeReactions: 0,
            totalMessages: 0
        };
        
        // Create embed
        const embed = new EmbedBuilder()
            .setTitle(`${targetUser.username}'s Aura`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setColor(userData.aura >= 0 ? '#4CAF50' : '#FF4500')
            .addFields(
                { name: 'Aura Points', value: `${userData.aura}`, inline: true },
                { name: 'Positive Reactions', value: `${userData.positiveReactions}`, inline: true },
                { name: 'Negative Reactions', value: `${userData.negativeReactions}`, inline: true },
                { name: 'Total Messages', value: `${userData.totalMessages}`, inline: true },
                { name: 'Aura per Message', value: userData.totalMessages > 0 ? 
                    (userData.aura / userData.totalMessages).toFixed(2) : '0', inline: true }
            )
            .setFooter({ text: 'Aura reflects how the community responds to your messages' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    },
};
