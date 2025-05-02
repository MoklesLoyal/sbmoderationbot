const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'guildBanAdd',
    async execute(ban) {
        try {
            if (ban.guild.id !== '374971715626991626') return;

            const logChannel = ban.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Member Banned')
                .setAuthor({ 
                    name: ban.user.tag, 
                    iconURL: ban.user.displayAvatarURL() 
                })
                .addFields(
                    { name: 'User ID', value: ban.user.id },
                    { name: 'Reason', value: ban.reason || 'No reason provided' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildBanAdd event:', error);
        }
    }
};
