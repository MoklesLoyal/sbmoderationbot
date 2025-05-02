const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('highlight')
        .setDescription('Make an announcement using a highlight credit')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to highlight')
                .setRequired(true)),

    async execute(interaction) {
        const creditsPath = path.join(__dirname, '../../data/highlight_credits.json');
        const userId = interaction.user.id;

        let credits = {};
        if (fs.existsSync(creditsPath)) {
            credits = JSON.parse(fs.readFileSync(creditsPath));
        }

        if (!credits[userId] || credits[userId] <= 0) {
            return await interaction.reply({
                content: "You don't have any highlight credits!",
                ephemeral: true
            });
        }

        credits[userId] -= 1;
        fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 4));

        const message = interaction.options.getString('message');
        
        await interaction.reply({
            content: `@everyone\n**Highlight from ${interaction.user}:**\n${message}`,
            allowedMentions: { parse: ['everyone'] }
        });

        await interaction.followUp({
            content: `You have ${credits[userId]} highlight credits remaining.`,
            ephemeral: true
        });
    },
};
