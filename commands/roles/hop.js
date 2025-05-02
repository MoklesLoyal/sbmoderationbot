const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

function getRolesBetween(guild, startRoleId, endRoleId) {
    const startRole = guild.roles.cache.get(startRoleId);
    const endRole = guild.roles.cache.get(endRoleId);
    
    return guild.roles.cache
        .filter(role => 
            role.position > Math.min(startRole.position, endRole.position) &&
            role.position < Math.max(startRole.position, endRole.position)
        )
        .sort((a, b) => b.position - a.position);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hop')
        .setDescription('Remove/hop a role or a clan'),
    async execute(interaction) {
        const member = interaction.member;
        const availableRoles = getRolesBetween(interaction.guild, '537727442597445691', '537725973802647564');
        
        const userRoles = availableRoles.filter(role => member.roles.cache.has(role.id));
        
        if (userRoles.size === 0) {
            return interaction.reply({
                content: 'You don\'t have any roles in the specified range to remove!',
                ephemeral: true
            });
        }

        const options = userRoles.map(role => ({
            label: role.name,
            value: role.id
        }));

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('role-select')
                    .setPlaceholder('Select roles to remove')
                    .setMinValues(1)
                    .setMaxValues(userRoles.size)
                    .addOptions(options)
            );

        const message = await interaction.reply({
            content: 'Select the roles you want to remove:',
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id;
        try {
            const response = await message.awaitMessageComponent({ filter, time: 60000 });
            
            await member.roles.remove(response.values);
            const removedRoles = response.values.map(roleId => 
                interaction.guild.roles.cache.get(roleId).name
            ).join(', ');

            await response.update({
                content: `Successfully removed roles: ${removedRoles}`,
                components: []
            });
        } catch (e) {
            await interaction.editReply({
                content: 'Role selection timed out.',
                components: []
            });
        }
    }
};