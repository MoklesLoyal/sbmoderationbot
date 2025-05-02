const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'threadCreate',
    async execute(thread) {
        try {
            if (thread.guild.id !== '374971715626991626') return;

            const logChannel = thread.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Thread Created')
                .setAuthor({ 
                    name: thread.guild.name, 
                    iconURL: thread.guild.iconURL() 
                })
                .addFields(
                    { name: 'Thread Name', value: thread.name },
                    { name: 'Parent Channel', value: thread.parent?.name || 'Unknown' },
                    { name: 'Created By', value: thread.ownerId || 'Unknown' }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in threadCreate event:', error);
        }
    }
};
