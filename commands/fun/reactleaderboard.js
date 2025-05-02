const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to reactions data file
const reactionsFilePath = path.join(__dirname, '..', '..', 'data', 'reactions.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactleaderboard')
        .setDescription('Shows the leaderboard of messages with the most reactions')
        .addIntegerOption(option => 
            option.setName('limit')
                .setDescription('Number of top messages to show (default: 10)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(25))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of reactions to count')
                .setRequired(false)
                .addChoices(
                    { name: 'Total Reactions', value: 'total' },
                    { name: 'Unique Users', value: 'unique' }
                )),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            // Check if data file exists
            if (!fs.existsSync(reactionsFilePath)) {
                return await interaction.editReply('No reaction data found yet. Messages with reactions will be tracked automatically.');
            }
            
            // Load reactions data
            const reactionsData = JSON.parse(fs.readFileSync(reactionsFilePath, 'utf8'));
            
            if (!reactionsData.messages || reactionsData.messages.length === 0) {
                return await interaction.editReply('No messages with reactions have been tracked yet.');
            }
            
            // Get count type (total or unique)
            const countType = interaction.options.getString('type') || 'total';
            
            // Sort messages by reaction count (descending)
            const sortedMessages = [...reactionsData.messages].sort((a, b) => {
                if (countType === 'unique') {
                    // Sort by unique user reactions
                    const aCount = a.uniqueReactionCount || 0;
                    const bCount = b.uniqueReactionCount || 0;
                    return bCount - aCount;
                } else {
                    // Sort by total reactions (default)
                    return b.reactionCount - a.reactionCount;
                }
            });
            
            // Get limit from options or default to 10
            const limit = interaction.options.getInteger('limit') || 10;
            
            // Take top N messages
            const topMessages = sortedMessages.slice(0, limit);
            
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('Reaction Leaderboard')
                .setColor('#FFD700')
                .setDescription(`Top ${topMessages.length} messages with the most ${countType === 'unique' ? 'unique user' : 'total'} reactions in <#374971715626991628>`)
                .setTimestamp();
            
            // Add fields for each top message
            topMessages.forEach((msg, index) => {
                const content = msg.content.length > 100 
                    ? msg.content.substring(0, 97) + '...' 
                    : msg.content;
                
                const reactionCount = countType === 'unique' 
                    ? (msg.uniqueReactionCount || 0)
                    : msg.reactionCount;
                    
                embed.addFields({
                    name: `#${index + 1}: ${reactionCount} ${countType === 'unique' ? 'unique users' : 'reactions'}`,
                    value: `"${content}" - <@${msg.authorId}>\n[Jump to message](https://discord.com/channels/${interaction.guild.id}/374971715626991628/${msg.id})`
                });
            });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error displaying reaction leaderboard:', error);
            await interaction.editReply('An error occurred while trying to display the reaction leaderboard.');
        }
    },
};
