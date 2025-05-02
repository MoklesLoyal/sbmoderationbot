const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const cards = require('../../data/cards.json');
const fs = require('fs');

function getRandomCard(guaranteedRarity = null) {
    const weights = Object.entries(cards.rarities).map(([rarity, data]) => ({
        rarity,
        weight: data.weight
    }));
    
    let selectedRarity;
    if (guaranteedRarity) {
        selectedRarity = guaranteedRarity;
    } else {
        const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        selectedRarity = weights.find(item => {
            random -= item.weight;
            return random <= 0;
        }).rarity;
    }
    
    const possibleCards = cards.cards.filter(card => card.rarity === selectedRarity);
    return possibleCards[Math.floor(Math.random() * possibleCards.length)];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('open-pack')
        .setDescription('Open a card pack from your inventory'),
    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Check if user has packs
        const inventory = getUserInventory(userId);
        if (!inventory.packs || inventory.packs.length === 0) {
            return interaction.reply('You don\'t have any packs to open!');
        }
        
        const pack = inventory.packs[0]; // Get first pack
        const drawnCards = [];
        
        // Draw cards based on pack type
        for (let i = 0; i < pack.cards; i++) {
            const isGuaranteed = i === pack.cards - 1;
            const card = getRandomCard(isGuaranteed ? pack.guaranteedRarity : null);
            drawnCards.push(card);
            addCardToCollection(userId, card.id);
        }
        
        // Remove pack from inventory
        removePackFromInventory(userId, pack.id);
        
        const embed = new EmbedBuilder()
            .setTitle('Pack Opening Results!')
            .setColor('#ffd700')
            .setDescription('Here are your new cards:');
            
        drawnCards.forEach(card => {
            const rarity = cards.rarities[card.rarity];
            embed.addFields({
                name: `${card.name} (${card.rarity})`,
                value: card.description,
                inline: true
            });
        });
        
        await interaction.reply({ embeds: [embed] });
    }
};

function getUserInventory(userId) {
    const userDataPath = `./users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        return {
            packs: userData.inventory || [],
            cards: userData.cards || []
        };
    }
    return { packs: [], cards: [] };
}

function removePackFromInventory(userId, packId) {
    const userDataPath = `./users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        
        // Remove the pack from inventory
        userData.inventory = userData.inventory.filter(pack => pack.id !== packId);
        
        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
    }
}
