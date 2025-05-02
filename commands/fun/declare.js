const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('declare')
        .setDescription('Declare a challenge against a clan or user')
        .addStringOption(option =>
            option.setName('target_type')
                .setDescription('Are you challenging a clan or a user?')
                .setRequired(true)
                .addChoices(
                    { name: 'Clan', value: 'clan' },
                    { name: 'User', value: 'user' }
                ))
        .addStringOption(option =>
            option.setName('target')
                .setDescription('Who are you challenging? (mention the clan name or user)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('fight_type')
                .setDescription('What type of fight is this?')
                .setRequired(true)
                .addChoices(
                    { name: '1 versus 1', value: '1v1' },
                    { name: 'Clan Wars', value: 'clanwars' },
                    { name: 'Wilderness', value: 'wildy' }
                ))
        .addIntegerOption(option =>
            option.setName('wager')
                .setDescription('How much gp is the wager?')
                .setRequired(true)
                .setMinValue(0)),

    async execute(interaction) {
        const targetType = interaction.options.getString('target_type');
        const target = interaction.options.getString('target');
        const fightType = interaction.options.getString('fight_type');
        const wager = interaction.options.getInteger('wager');

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚔️ Challenge Declaration ⚔️')
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .addFields(
                { name: 'Challenger', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Target Type', value: targetType.charAt(0).toUpperCase() + targetType.slice(1), inline: true },
                { name: 'Target', value: target, inline: true },
                { name: 'Fight Type', value: fightType.charAt(0).toUpperCase() + fightType.slice(1), inline: true },
                { name: 'Wager', value: `${wager} M`, inline: true },
                { name: 'Status', value: 'Pending...', inline: true }
            )
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_challenge')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('decline_challenge')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        const response = await interaction.reply({ 
            embeds: [embed], 
            components: [buttons],
            fetchReply: true 
        });

        const collector = response.createMessageComponentCollector({ time: 3600000 * 72 }); // 1 hour
        collector.on('collect', async i => {
            try {
                if (!i.member.roles.cache.has('689147294649679894')) {
                    await i.reply({ content: 'You do not have permission to respond to this challenge!', ephemeral: true });
                    return;
                }

                const newEmbed = EmbedBuilder.from(embed);
                
                if (i.customId === 'accept_challenge') {
                    newEmbed.spliceFields(5, 1, { name: 'Status', value: 'Accepted ✅', inline: true });
                } else if (i.customId === 'decline_challenge') {
                    newEmbed.spliceFields(5, 1, { name: 'Status', value: 'Declined ❌', inline: true });
                }

                await i.update({ 
                    embeds: [newEmbed], 
                    components: [] 
                }).catch(() => {
                    // If interaction fails, edit the original message instead
                    interaction.editReply({
                        embeds: [newEmbed],
                        components: []
                    });
                });
                
                collector.stop();
            } catch (error) {
                console.error('Error handling button interaction:', error);
            }
        });
    },
};
