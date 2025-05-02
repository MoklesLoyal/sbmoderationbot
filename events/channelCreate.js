const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ChannelCreate,
    async execute(channel) {
        // Skip if it's a DM channel or if it's the BBQ channel being created
        if (!channel.guild || channel.name === '🍖︱bbq') return;

        const logChannel = channel.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Channel Created')
            .setColor('#00FF00')
            .setDescription(`Channel: ${channel.name}`)
            .addFields(
                { name: 'Channel ID', value: channel.id },
                { name: 'Channel Type', value: channel.type.toString() }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    },
};
