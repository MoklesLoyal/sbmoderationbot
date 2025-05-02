const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Answers your yes/no questions')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question')
                .setRequired(true)),
    async execute(interaction) {
        const responses = ['Yes!', 'No.', 'Maybe...', 'Absolutely!', 'I doubt it'];
        const response = responses[Math.floor(Math.random() * responses.length)];
        await interaction.reply(`Question: ${interaction.options.getString('question')}\nAnswer: ${response}`);
    }
};
