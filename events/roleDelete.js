const { createLogEmbed } = require('../utils/embedCreator');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        try {
            if (role.guild.id !== '374971715626991626') return;

            const logChannel = role.guild.channels.cache.get('874490050497355776');
            if (!logChannel) return;

            const embed = createLogEmbed('Role Deleted')
                .setAuthor({ 
                    name: role.guild.name, 
                    iconURL: role.guild.iconURL() 
                })
                .addFields(
                    { name: 'Role Name', value: role.name },
                    { name: 'Role ID', value: role.id },
                    { name: 'Color', value: role.hexColor },
                    { name: 'Position', value: role.position.toString() }
                );

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in roleDelete event:', error);
        }
    }
};
