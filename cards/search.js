const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cards = require('../../data/cards.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for cards')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search by card name')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query').toLowerCase();
        const results = cards.cards.filter(card => 
            card.name.toLowerCase().includes(query) || 
            card.description.toLowerCase().includes(query)
        );
        
        const embed = new EmbedBuilder()
            .setTitle('Card Search Results')
            .setColor('#00ff00');
            
        if (results.length === 0) {
            embed.setDescription('No cards found matching your search.');
        } else {
            results.forEach(card => {
                embed.addFields({
                    name: `${card.name} (${card.rarity})`,
                    value: `ID: ${card.id}\n${card.description}`,
                    inline: true
                });
            });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};
