const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('The user ID to unban')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('You need ban permissions to use this!');
        }
        
        const userId = interaction.options.getString('userid');
        await interaction.guild.members.unban(userId);
        await interaction.reply(`Unbanned user with ID: ${userId}`);
    }
};
