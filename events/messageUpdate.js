const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        try {
            if (oldMessage.guild?.id !== '374971715626991626') return;
            if (oldMessage.author?.bot) return;
            
            const logChannel = oldMessage.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Message Updated')
                .setAuthor({ 
                    name: oldMessage.author.tag, 
                    iconURL: oldMessage.author.displayAvatarURL() 
                })
                .addFields(
                    { name: 'Channel', value: `${oldMessage.channel}` },
                    { name: 'Before', value: oldMessage.content || 'No content' },
                    { name: 'After', value: newMessage.content || 'No content' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in messageUpdate event:', error);
        }
    }
};
