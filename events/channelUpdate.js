const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'channelUpdate',
    async execute(oldChannel, newChannel) {
        try {
            if (oldChannel.guild.id !== '374971715626991626') return;

            const logChannel = oldChannel.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const changes = [];
            
            if (oldChannel.name !== newChannel.name) {
                changes.push({ name: 'Name Changed', value: `${oldChannel.name} → ${newChannel.name}` });
            }
            
            if (oldChannel.topic !== newChannel.topic) {
                changes.push({ 
                    name: 'Topic Changed', 
                    value: `Old: ${oldChannel.topic || 'None'}\nNew: ${newChannel.topic || 'None'}` 
                });
            }

            if (changes.length > 0) {
                const embed = createLogEmbed('Channel Updated')
                    .setAuthor({ 
                        name: newChannel.guild.name, 
                        iconURL: newChannel.guild.iconURL() 
                    })
                    .addFields(changes);

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error in channelUpdate event:', error);
        }
    }
};
