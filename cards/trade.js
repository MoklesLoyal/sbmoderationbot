const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cards = require('../../data/cards.json');

// Track active trades
const activeTrades = new Map();

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
        .setName('trade')
        .setDescription('Trade cards with another user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to trade with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('offer-card')
                .setDescription('Card ID you want to trade')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('request-card')
                .setDescription('Card ID you want in return')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('coins')
                .setDescription('Additional coins to offer in trade')
                .setMinValue(0)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const offerCardId = interaction.options.getString('offer-card');
        const requestCardId = interaction.options.getString('request-card');
        const coinsOffered = interaction.options.getInteger('coins') || 0;
        
        // Verify cards exist
        const offerCard = cards.cards.find(c => c.id === offerCardId);
        const requestCard = cards.cards.find(c => c.id === requestCardId);
        
        if (!offerCard || !requestCard) {
            return interaction.reply('Invalid card ID(s)');
        }
        
        // Check if user has the card they're offering
        const userCollection = getUserCollection(interaction.user.id);
        if (!userCollection.cards.includes(offerCardId)) {
            return interaction.reply('You don\'t own this card!');
        }
        
        if (coinsOffered > 0) {
            const userBalance = getUserBalance(interaction.user.id);
            if (userBalance < coinsOffered) {
                return interaction.reply('You don\'t have enough coins for this trade!');
            }
        }
        
        // Create trade buttons
        const acceptButton = new ButtonBuilder()
            .setCustomId('accept_trade')
            .setLabel('Accept Trade')
            .setStyle(ButtonStyle.Success);
            
        const declineButton = new ButtonBuilder()
            .setCustomId('decline_trade')
            .setLabel('Decline Trade')
            .setStyle(ButtonStyle.Danger);
            
        const row = new ActionRowBuilder()
            .addComponents(acceptButton, declineButton);
            
        const embed = new EmbedBuilder()
            .setTitle('Trade Offer')
            .setDescription(`${interaction.user.tag} wants to trade with ${target.tag}`)
            .addFields(
                { name: 'Offering', value: `${offerCard.name} (${offerCard.rarity}) + ${coinsOffered} coins`, inline: true },
                { name: 'Requesting', value: `${requestCard.name} (${requestCard.rarity})`, inline: true }
            )
            .setColor('#ffd700');
            
        const message = await interaction.reply({
            content: `<@${target.id}>`,
            embeds: [embed],
            components: [row]
        });
        
        // Store trade info
        activeTrades.set(message.id, {
            sender: interaction.user.id,
            receiver: target.id,
            offerCard: offerCardId,
            requestCard: requestCardId,
            coins: coinsOffered,
            expires: Date.now() + 300000 // 5 minutes
        });
        
        // Clean up expired trade after 5 minutes
        setTimeout(() => {
            activeTrades.delete(message.id);
            message.edit({ components: [] });
        }, 300000);
    }
};