const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'inviteCreate',
    async execute(invite) {
        try {
            if (invite.guild.id !== '374971715626991626') return;

            const logChannel = invite.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Invite Created')
                .setAuthor({ 
                    name: invite.inviter?.tag || 'Unknown', 
                    iconURL: invite.inviter?.displayAvatarURL() 
                })
                .addFields(
                    { name: 'Code', value: invite.code },
                    { name: 'Channel', value: invite.channel.name },
                    { name: 'Max Uses', value: invite.maxUses?.toString() || 'Unlimited' },
                    { name: 'Expires', value: invite.maxAge ? `<t:${Math.floor((Date.now() + invite.maxAge * 1000) / 1000)}:R>` : 'Never' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in inviteCreate event:', error);
        }
    }
};
