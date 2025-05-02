const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAuraLeaderboard } = require('../../utils/auraSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auraleaderboard')
        .setDescription('Shows the aura points leaderboard')
        .addSubcommand(subcommand =>
            subcommand
                .setName('highest')
                .setDescription('Shows users with the highest aura points')
                .addIntegerOption(option => 
                    option.setName('limit')
                        .setDescription('Number of users to show (default: 10)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(25)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lowest')
                .setDescription('Shows users with the lowest aura points')
                .addIntegerOption(option => 
                    option.setName('limit')
                        .setDescription('Number of users to show (default: 10)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(25))),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const subcommand = interaction.options.getSubcommand();
            const limit = interaction.options.getInteger('limit') || 10;
            
            // Get leaderboard (ascending for lowest, descending for highest)
            const isAscending = subcommand === 'lowest';
            const leaderboard = getAuraLeaderboard(isAscending);
            
            if (leaderboard.length === 0) {
                return await interaction.editReply('No aura data found yet. Users will gain aura when their messages receive reactions.');
            }
            
            // Take top N users
            const topUsers = leaderboard.slice(0, limit);
            
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(`Aura ${isAscending ? 'Lowest' : 'Highest'} Leaderboard`)
                .setColor(isAscending ? '#FF4500' : '#4CAF50')
                .setDescription(`Users with the ${isAscending ? 'lowest' : 'highest'} aura points`)
                .setTimestamp();
            
            // Add fields for each user
            topUsers.forEach((user, index) => {
                embed.addFields({
                    name: `#${index + 1}: ${user.aura} Aura Points`,
                    value: `<@${user.id}>\n👍 ${user.positiveReactions} positive | 👎 ${user.negativeReactions} negative | 💬 ${user.totalMessages} messages`
                });
            });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error displaying aura leaderboard:', error);
            await interaction.editReply('An error occurred while trying to display the aura leaderboard.');
        }
    },
};
