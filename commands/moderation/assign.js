const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assign')
        .setDescription('Assign a role to a user based on your lead role')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to assign the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign')
                .setRequired(true)),
    async execute(interaction) {
        const hasLeadRole = interaction.member.roles.cache.some(role => 
            role.name.toLowerCase().includes('lead')
        );

        if (!hasLeadRole) {
            return interaction.reply({ 
                content: 'You need a lead role to use this command!', 
                ephemeral: true 
            });
        }

        const targetUser = interaction.options.getMember('target');
        const roleToAssign = interaction.options.getRole('role');
        
        // Check if trying to assign a lead role
        if (roleToAssign.name.toLowerCase().includes('lead')) {
            return interaction.reply({
                content: 'You cannot assign lead roles with this command!',
                ephemeral: true
            });
        }
        
        const userLeadRole = interaction.member.roles.cache.find(role => 
            role.name.toLowerCase().includes('lead')
        );

        const baseRoleName = userLeadRole.name.toLowerCase().replace('lead', '').trim();
        if (!roleToAssign.name.toLowerCase().includes(baseRoleName)) {
            return interaction.reply({ 
                content: `You can only assign roles related to your ${userLeadRole.name} position!`, 
                ephemeral: true 
            });
        }

        await targetUser.roles.add(roleToAssign);
        
        await interaction.reply({
            content: `Successfully assigned ${roleToAssign} to ${targetUser}!`,
            ephemeral: true
        });

        const logChannel = await interaction.client.channels.fetch('874490050497355776');
        
        const logEmbed = new EmbedBuilder()
            .setTitle('Role Assignment Log')
            .setColor('#00FF00')
            .addFields(
                { name: 'Admin', value: interaction.user.tag, inline: true },
                { name: 'Target User', value: targetUser.user.tag, inline: true },
                { name: 'Role Assigned', value: roleToAssign.name, inline: true }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
    }
};