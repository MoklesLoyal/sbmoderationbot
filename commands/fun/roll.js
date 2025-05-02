const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a random number between 1-100'),
    async execute(interaction) {
        const number = Math.floor(Math.random() * 100) + 1;
        await interaction.reply(`You rolled: ${number}`);
    }
};
