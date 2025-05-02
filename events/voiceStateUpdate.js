const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        try {
            if (oldState.guild.id !== '374971715626991626') return;

            const logChannel = oldState.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            let description = '';
            if (!oldState.channel && newState.channel) {
                description = `Joined ${newState.channel.name}`;
            } else if (oldState.channel && !newState.channel) {
                description = `Left ${oldState.channel.name}`;
            } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
                description = `Moved from ${oldState.channel.name} to ${newState.channel.name}`;
            } else {
                return; // No relevant change
            }

            const embed = createLogEmbed('Voice Channel Update')
                .setAuthor({ 
                    name: newState.member.user.tag, 
                    iconURL: newState.member.user.displayAvatarURL() 
                })
                .setDescription(description);

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in voiceStateUpdate event:', error);
        }
    }
};
