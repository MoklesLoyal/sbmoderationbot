const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cards = require('../../data/cards.json');
const fs = require('fs');
const path = require('path');

// Track daily claims
const dailyClaims = new Map();

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
        .setName('daily')
        .setDescription('Claim your daily card and coin rewards'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const lastClaim = dailyClaims.get(userId);
        const now = Date.now();
        
        if (lastClaim && now - lastClaim < 86400000) {
            const timeLeft = 86400000 - (now - lastClaim);
            const hoursLeft = Math.floor(timeLeft / 3600000);
            const minutesLeft = Math.floor((timeLeft % 3600000) / 60000);
            
            return interaction.reply(`You can claim your next daily reward in ${hoursLeft}h ${minutesLeft}m`);
        }
        
        // Give random card
        const card = getRandomCard();
        addCardToCollection(userId, card.id);
        
        // Give daily coins
        const dailyCoins = 1000;
        const currentBalance = getUserBalance(userId);
        updateUserBalance(userId, currentBalance + dailyCoins);
        
        dailyClaims.set(userId, now);
        
        const embed = new EmbedBuilder()
            .setTitle('Daily Rewards!')
            .setDescription(`You received:\n- ${card.name}\n- ${dailyCoins} coins`)
            .setColor(cards.rarities[card.rarity].color)
            .setImage(card.image)
            .addFields(
                { name: 'Card Rarity', value: card.rarity, inline: true },
                { name: 'New Balance', value: `${currentBalance + dailyCoins} coins`, inline: true }
            );
            
        await interaction.reply({ embeds: [embed] });
    }
};