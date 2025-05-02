const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'guildBanRemove',
    async execute(ban) {
        try {
            if (ban.guild.id !== '374971715626991626') return;

            const logChannel = ban.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Member Unbanned')
                .setAuthor({ 
                    name: ban.user.tag, 
                    iconURL: ban.user.displayAvatarURL() 
                })
                .addFields(
                    { name: 'User ID', value: ban.user.id },
                    { name: 'User Tag', value: ban.user.tag }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildBanRemove event:', error);
        }
    }
};
