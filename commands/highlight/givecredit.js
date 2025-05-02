const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givecredit')
        .setDescription('Give highlight credits to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give credits to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of credits to give')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const creditsPath = path.join(__dirname, '../../data/highlight_credits.json');
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        let credits = {};
        if (fs.existsSync(creditsPath)) {
            credits = JSON.parse(fs.readFileSync(creditsPath));
        }

        if (!credits[targetUser.id]) {
            credits[targetUser.id] = 0;
        }

        credits[targetUser.id] += amount;

        fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 4));

        await interaction.reply({
            content: `Gave ${amount} highlight credit(s) to ${targetUser}. They now have ${credits[targetUser.id]} credits.`,
            ephemeral: true
        });
    },
};
