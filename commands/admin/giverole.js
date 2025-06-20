const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Give a role to a user (roles below position hierarchy)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to give the role to')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to give to the user')
                .setRequired(true)),
    
    async execute(interaction) {
        // Check if user has the required role
        const requiredRoleId = '689147294649679894';
        const hierarchyLimitRoleId = '1212140169164234803';
        
        // Roles that cannot be given out
        const restrictedRoleIds = [
            '689147294649679894',
            '909511845717626900', 
            '398406049360773121',
            '628806923893997568'
        ];
        
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command.',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('user');
        const targetRole = interaction.options.getRole('role');
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        // Check if target member exists in the guild
        if (!targetMember) {
            return interaction.reply({
                content: '❌ User not found in this server.',
                ephemeral: true
            });
        }

        // Check if the target role is in the restricted list
        if (restrictedRoleIds.includes(targetRole.id)) {
            return interaction.reply({
                content: `❌ The role **${targetRole.name}** cannot be assigned using this command.`,
                ephemeral: true
            });
        }

        // Get the hierarchy limit role
        const hierarchyLimitRole = interaction.guild.roles.cache.get(hierarchyLimitRoleId);
        if (!hierarchyLimitRole) {
            return interaction.reply({
                content: '❌ Hierarchy limit role not found.',
                ephemeral: true
            });
        }

        // Check if the target role is below the hierarchy limit role
        if (targetRole.position >= hierarchyLimitRole.position) {
            return interaction.reply({
                content: `❌ You can only assign roles below <@&${hierarchyLimitRoleId}> in the hierarchy.`,
                ephemeral: true
            });
        }

        // Check if the bot can manage the role
        if (targetRole.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({
                content: '❌ I cannot assign this role as it is higher than or equal to my highest role.',
                ephemeral: true
            });
        }

        // Check if the user already has the role
        if (targetMember.roles.cache.has(targetRole.id)) {
            return interaction.reply({
                content: `❌ ${targetUser.tag} already has the role ${targetRole.name}.`,
                ephemeral: true
            });
        }

        try {
            // Add the role to the target member
            await targetMember.roles.add(targetRole);
            
            return interaction.reply({
                content: `✅ Successfully gave the role **${targetRole.name}** to ${targetUser.tag}.`,
                ephemeral: false
            });

        } catch (error) {
            console.error('Error giving role:', error);
            return interaction.reply({
                content: '❌ An error occurred while trying to give the role. Please check my permissions.',
                ephemeral: true
            });
        }
    }
};