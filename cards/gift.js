const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cards = require('../../data/cards.json');
const fs = require('fs');
const path = require('path');

function getUserBalance(userId) {
    const userDataPath = `./data/users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        return userData.balance;
    }
    return 0;
}

function updateUserBalance(userId, newBalance) {
    const userDataPath = `./data/users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        userData.balance = newBalance;
        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Gift a card or coins to another user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to gift to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('card-id')
                .setDescription('Card to gift'))
        .addIntegerOption(option =>
            option.setName('coins')
                .setDescription('Amount of coins to gift')
                .setMinValue(1)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const cardId = interaction.options.getString('card-id');
        const coinsAmount = interaction.options.getInteger('coins') || 0;
        
        if (!cardId && coinsAmount === 0) {
            return interaction.reply('You must gift either a card, coins, or both!');
        }
        
        const senderBalance = getUserBalance(interaction.user.id);
        
        if (coinsAmount > senderBalance) {
            return interaction.reply('You don\'t have enough coins to gift!');
        }
        
        const embed = new EmbedBuilder()
            .setTitle('Gift Sent!')
            .setColor('#00ff00');
            
        if (cardId) {
            const card = cards.cards.find(c => c.id === cardId);
            removeCardFromCollection(interaction.user.id, cardId);
            addCardToCollection(target.id, cardId);
            embed.addFields({ name: 'Card Gifted', value: card.name });
        }
        
        if (coinsAmount > 0) {
            updateUserBalance(interaction.user.id, senderBalance - coinsAmount);
            updateUserBalance(target.id, getUserBalance(target.id) + coinsAmount);
            embed.addFields({ name: 'Coins Gifted', value: `${coinsAmount} coins` });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
};