const { createLogEmbed } = require('../utils/embedCreator');
const { updatePureCounter } = require('../utils/roleCounter');

module.exports = {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
        try {
            if (oldRole.guild.id !== '374971715626991626') return;

            const logChannel = oldRole.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const changes = [];

            if (oldRole.name !== newRole.name) {
                changes.push({ name: 'Name Changed', value: `${oldRole.name} → ${newRole.name}` });
            }

            if (oldRole.hexColor !== newRole.hexColor) {
                changes.push({ name: 'Color Changed', value: `${oldRole.hexColor} → ${newRole.hexColor}` });
            }

            if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                const addedPerms = newRole.permissions.toArray().filter(p => !oldRole.permissions.has(p));
                const removedPerms = oldRole.permissions.toArray().filter(p => !newRole.permissions.has(p));

                if (addedPerms.length > 0) {
                    changes.push({ name: 'Permissions Added', value: addedPerms.join(', ') });
                }
                if (removedPerms.length > 0) {
                    changes.push({ name: 'Permissions Removed', value: removedPerms.join(', ') });
                }
            }

            if (changes.length > 0) {
                const embed = createLogEmbed('Role Updated')
                    .setAuthor({ 
                        name: newRole.guild.name, 
                        iconURL: newRole.guild.iconURL() 
                    })
                    .addFields(changes);

                await logChannel.send({ embeds: [embed] });
            }

            // Check if the updated role is the target role (Pure role)
            if (newRole.id === '863277258395484160') {
                await updatePureCounter(newRole.guild);
            }
        } catch (error) {
            console.error('Error in roleUpdate event:', error);
        }
    }
};
