const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cards = require('../../data/cards.json');

// Track active listings
const marketListings = new Map();

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
        .setName('market')
        .setDescription('Card marketplace')
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('Buy a card from the marketplace')
                .addStringOption(option =>
                    option.setName('listing-id')
                        .setDescription('ID of the listing')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sell')
                .setDescription('Sell a card on the marketplace')
                .addStringOption(option =>
                    option.setName('card-id')
                        .setDescription('Card to sell')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('price')
                        .setDescription('Selling price')
                        .setRequired(true))),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'buy') {
            const listingId = interaction.options.getString('listing-id');
            const listing = marketListings.get(listingId);
            const buyerBalance = getUserBalance(interaction.user.id);
            
            if (buyerBalance < listing.price) {
                return interaction.reply('Insufficient balance for this purchase!');
            }
            
            // Process transaction
            updateUserBalance(interaction.user.id, buyerBalance - listing.price);
            updateUserBalance(listing.sellerId, getUserBalance(listing.sellerId) + listing.price);
            
            // Transfer card ownership
            // Rest of your buying logic...
        }
        
        if (interaction.options.getSubcommand() === 'sell') {
            // Selling logic...
        }
    }
};