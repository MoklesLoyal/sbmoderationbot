const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cards = require('../../data/cards.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collection')
        .setDescription('View your card collection')
        .addStringOption(option => 
            option.setName('rarity')
                .setDescription('Filter by rarity')
                .addChoices(
                    { name: 'All', value: 'all' },
                    { name: 'Common', value: 'common' },
                    { name: 'Rare', value: 'rare' },
                    { name: 'Epic', value: 'epic' },
                    { name: 'Legendary', value: 'legendary' }
                )),
    async execute(interaction) {
        const userId = interaction.user.id;
        const rarity = interaction.options.getString('rarity') || 'all';
        
        const collection = getUserCollection(userId);
        let userCards = collection.cards || [];
        
        if (rarity !== 'all') {
            userCards = userCards.filter(cardId => {
                const card = cards.cards.find(c => c.id === cardId);
                return card.rarity === rarity;
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Collection`)
            .setColor('#00ff00')
            .setDescription(`Total Cards: ${userCards.length}`);
            
        // Group cards by rarity for display
        const groupedCards = {};
        userCards.forEach(cardId => {
            const card = cards.cards.find(c => c.id === cardId);
            if (!groupedCards[card.rarity]) {
                groupedCards[card.rarity] = [];
            }
            groupedCards[card.rarity].push(card);
        });
        
        Object.entries(groupedCards).forEach(([rarity, cards]) => {
            embed.addFields({
                name: `${rarity.toUpperCase()} (${cards.length})`,
                value: cards.map(card => card.name).join('\n') || 'None',
                inline: true
            });
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};
