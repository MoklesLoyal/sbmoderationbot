const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
            return interaction.reply('You need kick permissions to use this!');
        }
        
        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);
        
        await member.kick();
        await interaction.reply(`Successfully kicked ${target.tag}`);
    }
};
