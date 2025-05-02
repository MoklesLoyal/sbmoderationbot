const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ChannelDelete,
    async execute(channel) {
        // Skip if it's a DM channel
        if (!channel.guild) return;

        const logChannel = channel.guild.channels.cache.find(c => c.name === 'mod-logs');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Channel Deleted')
            .setColor('#FF0000')
            .setDescription(`Channel: ${channel.name}`)
            .addFields(
                { name: 'Channel ID', value: channel.id },
                { name: 'Channel Type', value: channel.type.toString() }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    },
};
