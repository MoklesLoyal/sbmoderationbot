const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to users directory
const usersPath = path.join(__dirname, '../../users');

// Create users directory if it doesn't exist
if (!fs.existsSync(usersPath)) {
    fs.mkdirSync(usersPath);
}

function getUserData(userId) {
    const userPath = path.join(usersPath, `${userId}.json`);
    if (!fs.existsSync(userPath)) {
        const defaultData = {
            balance: 0,
            lastDaily: null
        };
        fs.writeFileSync(userPath, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    return JSON.parse(fs.readFileSync(userPath, 'utf8'));
}

function saveUserData(userId, data) {
    const userPath = path.join(usersPath, `${userId}.json`);
    fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bank')
        .setDescription('Check your Sharkbrew coin balance'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const userData = getUserData(userId);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏦 Sharkbrew Bank')
            .setDescription(`**${interaction.user.username}'s Balance**`)
            .addFields({
                name: 'Current Balance',
                value: `${userData.balance} Sharkbrew coins <:sbcoins:1322147545866174515>`
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
