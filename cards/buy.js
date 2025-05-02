const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const packs = require('../../data/packs.json');
const fs = require('fs');
const path = require('path');

function getUserBalance(userId) {
    const userDataPath = `./users/${userId}.json`;
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
        .setName('buy-pack')
        .setDescription('Buy a card pack')
        .addStringOption(option =>
            option.setName('pack')
                .setDescription('The pack to buy')
                .setRequired(true)
                .addChoices(
                    { name: 'Basic Pack (1000)', value: 'basic' },
                    { name: 'Premium Pack (5000)', value: 'premium' }
                )),
    async execute(interaction) {
        const packType = interaction.options.getString('pack');
        const pack = packs[packType];
        const userId = interaction.user.id;
        
        const currentBalance = getUserBalance(userId);
        
        if (currentBalance < pack.price) {
            return interaction.reply(`You need ${pack.price} coins to buy this pack. Current balance: ${currentBalance}`);
        }
        
        // Update balance
        const newBalance = currentBalance - pack.price;
        updateUserBalance(userId, newBalance);
        
        // Rest of your pack buying logic...
        await addPackToInventory(userId, packType);
        
        const embed = new EmbedBuilder()
            .setTitle('Pack Purchased!')
            .setDescription(`You bought a ${pack.name} for ${pack.price} coins`)
            .setColor('#00ff00')
            .addFields(
                { name: 'Pack Contains', value: `${pack.cards} cards` },
                { name: 'New Balance', value: `${newBalance} coins` }
            );
            
        await interaction.reply({ embeds: [embed] });
    }
};

function addPackToInventory(userId, packType) {
    const userDataPath = `./users/${userId}.json`;
    if (fs.existsSync(userDataPath)) {
        const userData = JSON.parse(fs.readFileSync(userDataPath));
        
        // Initialize inventory if it doesn't exist
        if (!userData.inventory) {
            userData.inventory = [];
        }
        
        // Add the pack to inventory
        userData.inventory.push({
            type: packType,
            id: Date.now(), // Unique ID for the pack
            obtained: new Date().toISOString()
        });
        
        fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));
    }
}
