const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild) {
        try {
            if (oldGuild.id !== '374971715626991626') return;

            const logChannel = newGuild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const changes = [];

            if (oldGuild.name !== newGuild.name) {
                changes.push({ name: 'Server Name Changed', value: `${oldGuild.name} → ${newGuild.name}` });
            }

            if (oldGuild.iconURL() !== newGuild.iconURL()) {
                changes.push({ name: 'Server Icon Changed', value: 'Server icon has been updated' });
            }

            if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
                changes.push({ name: 'Server Banner Changed', value: 'Server banner has been updated' });
            }

            if (changes.length > 0) {
                const embed = createLogEmbed('Server Updated')
                    .setAuthor({ 
                        name: newGuild.name, 
                        iconURL: newGuild.iconURL() 
                    })
                    .addFields(changes);

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error in guildUpdate event:', error);
        }
    }
};
