const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cards = require('../../data/cards.json');

function getUserBalance(userId) {
    const userDataPath = `./data/users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        return userData.balance;
    }
    return 0;
}

function getUserCollection(userId) {
    const userDataPath = `./data/users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        return userData.collection || { cards: [] };
    }
    return { cards: [] };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showcase')
        .setDescription('Showcase your best cards and wealth')
        .addStringOption(option =>
            option.setName('card-id')
                .setDescription('Specific card to showcase'))
        .addBooleanOption(option =>
            option.setName('show-balance')
                .setDescription('Display your wealth alongside cards')),
    async execute(interaction) {
        const userId = interaction.user.id;
        const specificCardId = interaction.options.getString('card-id');
        const showBalance = interaction.options.getBoolean('show-balance') ?? true;
        const collection = getUserCollection(userId);
        
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Showcase`)
            .setColor('#ffd700');
        
        if (specificCardId) {
            const card = cards.cards.find(c => c.id === specificCardId);
            embed.setImage(card.image)
                .addFields(
                    { name: 'Featured Card', value: card.name, inline: true },
                    { name: 'Rarity', value: card.rarity, inline: true }
                );
        } else {
            // Show rarest cards
            const legendaryCards = collection.cards
                .filter(id => cards.cards.find(c => c.id === id).rarity === 'legendary')
                .slice(0, 3);
                
            if (legendaryCards.length > 0) {
                embed.addFields({
                    name: '🌟 Legendary Collection 🌟',
                    value: legendaryCards.map(id => cards.cards.find(c => c.id === id).name).join('\n')
                });
            }
        }
        
        if (showBalance) {
            const balance = getUserBalance(userId);
            embed.addFields({ name: 'Current Wealth', value: `${balance} coins` });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};