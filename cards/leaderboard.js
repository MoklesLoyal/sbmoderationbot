const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getAllUserBalances() {
    const usersPath = './data/users/';
    const users = {};
    
    fs.readdirSync(usersPath).forEach(file => {
        if (file.endsWith('.json')) {
            const userId = file.replace('.json', '');
            const userData = JSON.parse(fs.readFileSync(path.join(usersPath, file)));
            users[userId] = userData.balance;
        }
    });
    return users;
}

function calculateUserWorth(userId) {
    const balance = getUserBalance(userId);
    const collection = getUserCollection(userId);
    const collectionValue = calculateCollectionValue(collection);
    return { balance, collectionValue, total: balance + collectionValue };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cardleaderboard')
        .setDescription('View the top card collectors')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Leaderboard category')
                .addChoices(
                    { name: 'Total Wealth', value: 'total' },
                    { name: 'Collection Value', value: 'collection' },
                    { name: 'Legendary Cards', value: 'legendary' }
                )),
    async execute(interaction) {
        const category = interaction.options.getString('category') || 'total';
        const users = getAllUserBalances();
        
        let leaderboardData = Object.entries(users).map(([userId, balance]) => {
            const worth = calculateUserWorth(userId);
            const legendaryCount = getUserCollection(userId).cards
                .filter(id => cards.cards.find(c => c.id === id).rarity === 'legendary').length;
            
            return {
                userId,
                total: worth.total,
                collection: worth.collectionValue,
                legendary: legendaryCount
            };
        });
        
        leaderboardData.sort((a, b) => b[category] - a[category]);
        
        const embed = new EmbedBuilder()
            .setTitle('🏆 Card Collectors Leaderboard 🏆')
            .setColor('#ffd700')
            .setDescription(
                leaderboardData.slice(0, 10)
                    .map((data, index) => 
                        `${index + 1}. <@${data.userId}> - ${data[category]} ${category === 'legendary' ? 'cards' : 'coins'}`)
                    .join('\n')
            );
            
        await interaction.reply({ embeds: [embed] });
    }
};
