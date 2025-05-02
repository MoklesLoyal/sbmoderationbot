const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            if (member.guild.id !== '374971715626991626') return;

            const logChannel = member.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Member Joined')
                .setAuthor({ 
                    name: member.user.tag, 
                    iconURL: member.user.displayAvatarURL() 
                })
                .addFields(
                    { name: 'User ID', value: member.user.id },
                    { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` },
                    { name: 'Member Count', value: member.guild.memberCount.toString() }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    }
};
