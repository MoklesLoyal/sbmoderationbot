const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        try {
            if (message.guild?.id !== '374971715626991626') return;
            if (message.author?.bot) return;

            const logChannel = message.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Message Deleted')
                .setAuthor({ 
                    name: message.author?.tag || 'Unknown User', 
                    iconURL: message.author?.displayAvatarURL() 
                })
                .addFields(
                    { name: 'Channel', value: `${message.channel}` },
                    { name: 'Content', value: message.content || 'No content' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in messageDelete event:', error);
        }
    }
};
