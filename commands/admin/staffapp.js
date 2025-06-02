const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staffapp')
        .setDescription('Send a staff application message with button')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        // Create embed for the staff application message
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Staff Application')
            .setDescription('Are you interested in becoming a moderator?\n\nClick the button below to express your interest and a staff member will get back to you as soon as possible!')
            .setColor('#0099ff')
            .setFooter({ text: 'Staff Team' })
            .setTimestamp();

        // Create button
        const button = new ButtonBuilder()
            .setCustomId('staff_application')
            .setLabel('Apply for Staff')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🛡️');

        const row = new ActionRowBuilder()
            .addComponents(button);

        // Send the message with embed and button
        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};