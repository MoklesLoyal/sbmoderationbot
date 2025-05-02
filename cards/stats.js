const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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

function calculateCollectionValue(collection) {
    let totalValue = 0;
    collection.cards.forEach(cardId => {
        const card = cards.cards.find(c => c.id === cardId);
        switch(card.rarity) {
            case 'common': totalValue += 100; break;
            case 'rare': totalValue += 500; break;
            case 'epic': totalValue += 2000; break;
            case 'legendary': totalValue += 10000; break;
        }
    });
    return totalValue;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cardstats')
        .setDescription('View your card collection statistics'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const collection = getUserCollection(userId);
        const currentBalance = getUserBalance(userId);
        const collectionValue = calculateCollectionValue(collection);
        
        const embed = new EmbedBuilder()
            .setTitle('Collection Statistics')
            .setDescription(`${interaction.user.username}'s Card Empire`)
            .addFields(
                { name: 'Current Balance', value: `${currentBalance} coins`, inline: true },
                { name: 'Collection Value', value: `${collectionValue} coins`, inline: true },
                { name: 'Total Worth', value: `${currentBalance + collectionValue} coins`, inline: true },
                { name: 'Common Cards', value: `${collection.cards.filter(id => cards.cards.find(c => c.id === id).rarity === 'common').length}`, inline: true },
                { name: 'Rare Cards', value: `${collection.cards.filter(id => cards.cards.find(c => c.id === id).rarity === 'rare').length}`, inline: true },
                { name: 'Epic Cards', value: `${collection.cards.filter(id => cards.cards.find(c => c.id === id).rarity === 'epic').length}`, inline: true },
                { name: 'Legendary Cards', value: `${collection.cards.filter(id => cards.cards.find(c => c.id === id).rarity === 'legendary').length}`, inline: true }
            )
            .setColor('#ffd700')
            .setTimestamp();
            
        await interaction.reply({ embeds: [embed] });
    }
};