const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            if (member.guild.id !== '374971715626991626') return;

            const logChannel = member.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Member Left')
                .setAuthor({ 
                    name: member.user.tag, 
                    iconURL: member.user.displayAvatarURL() 
                })
                .addFields(
                    { name: 'User ID', value: member.user.id },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` },
                    { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberRemove event:', error);
        }
    }
};
