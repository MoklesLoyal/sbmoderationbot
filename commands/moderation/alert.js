const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Alert moderators for emergency situations')
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Why do you need moderator assistance?')
                .setRequired(true)),

    async execute(interaction) {
        // First, send an ephemeral warning message with confirmation button
        const warningEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Emergency Alert System Warning')
            .setDescription('This command will ping all available moderators. Please confirm you understand:')
            .addFields(
                { name: 'Usage Policy', value: 'This command should only be used for genuine emergencies requiring immediate moderator attention.' },
                { name: 'Consequences', value: 'Misuse or abuse of this command may result in:\n• Temporary timeout\n• Permanent ban for extreme cases' }
            );

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_alert')
            .setLabel('I Understand & Confirm')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton);

        const response = await interaction.reply({
            embeds: [warningEmbed],
            components: [row],
            ephemeral: true
        });

        // Wait for button confirmation
        try {
            const confirmation = await response.awaitMessageComponent({ time: 30000 });

            if (confirmation.customId === 'confirm_alert') {
                const reason = interaction.options.getString('reason');
                const alertEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚨 EMERGENCY ALERT 🚨')
                    .addFields(
                        { name: 'Reported by', value: `${interaction.user}`, inline: true },
                        { name: 'Channel', value: `${interaction.channel}`, inline: true },
                        { name: 'Reason', value: reason }
                    )
                    .setTimestamp();

                // Send the alert to the channel and ping mods
                await interaction.channel.send({
                    content: '<@&689147294649679894>',
                    embeds: [alertEmbed]
                });

                await confirmation.update({
                    content: 'Alert sent successfully. A moderator will assist you shortly.',
                    embeds: [],
                    components: []
                });
            }
        } catch (e) {
            await interaction.editReply({
                content: 'Alert cancelled - confirmation timed out.',
                embeds: [],
                components: []
            });
        }
    }
};
