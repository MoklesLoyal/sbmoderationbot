const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Role IDs for Clan Wars Clan and Wilderness Clan of the Month
const CLAN_WARS_CLAN_ROLE_ID = '874510046208360459';
const WILDERNESS_ClAN_ROLE_ID = '876370089987952700';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('award')
        .setDescription('Manage Clan Wars Clan of the Month roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('cwcotm')
                .setDescription('Assign Clan Wars Clan of the Month role to users with a specific role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role whose members will receive Clan Wars Clan of the Month')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('wcotm')
                .setDescription('Assign Wilderness Clan of the Month role to users with a specific role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role whose members will receive Wilderness Clan of the Month')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove_cwcotm')
                .setDescription('Remove Clan Wars Clan of the Month role from all users who have it')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove_wcotm')
                .setDescription('Remove Wilderness Clan of the Month role from all users who have it')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        // Check if the user has permission to manage roles
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({ 
                content: 'You do not have permission to manage roles.', 
                ephemeral: true 
            });
        }

        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        
        try {
            if (subcommand === 'cwcotm') {
                const targetRole = interaction.options.getRole('role');
                await assignRoleToMembers(interaction, targetRole.id, CLAN_WARS_CLAN_ROLE_ID);
                await interaction.editReply(`Successfully assigned Clan Wars Clan of the Month to members with the ${targetRole.name} role.`);
            } 
            else if (subcommand === 'wcotm') {
                const targetRole = interaction.options.getRole('role');
                await assignRoleToMembers(interaction, targetRole.id, WILDERNESS_ClAN_ROLE_ID);
                await interaction.editReply(`Successfully assigned Wilderness Clan of the Month to members with the ${targetRole.name} role.`);
            }
            else if (subcommand === 'remove_cwcotm') {
                const removedCount = await removeRoleFromMembers(interaction, CLAN_WARS_CLAN_ROLE_ID);
                await interaction.editReply(`Successfully removed Clan Wars Clan of the Month role from ${removedCount} members.`);
            }
            else if (subcommand === 'remove_wcotm') {
                const removedCount = await removeRoleFromMembers(interaction, WILDERNESS_ClAN_ROLE_ID);
                await interaction.editReply(`Successfully removed Wilderness Clan of the Month role from ${removedCount} members.`);
            }
        } catch (error) {
            console.error('Error managing roles:', error);
            await interaction.editReply('An error occurred while managing roles.');
        }
    }
};

async function assignRoleToMembers(interaction, sourceRoleId, targetRoleId) {
    const guild = interaction.guild;
    
    // Fetch all guild members (this might take time for larger servers)
    await guild.members.fetch();
    
    // Get the target role
    const targetRole = guild.roles.cache.get(targetRoleId);
    if (!targetRole) {
        throw new Error(`Target role with ID ${targetRoleId} not found.`);
    }
    
    // Get members with the source role
    const membersWithRole = guild.members.cache.filter(member => 
        member.roles.cache.has(sourceRoleId)
    );
    
    // Assign the target role to each member
    let assignedCount = 0;
    for (const [_, member] of membersWithRole) {
        try {
            await member.roles.add(targetRole);
            assignedCount++;
        } catch (error) {
            console.error(`Failed to assign role to ${member.user.tag}:`, error);
        }
    }
    
    return assignedCount;
}

async function removeRoleFromMembers(interaction, roleId) {
    const guild = interaction.guild;
    
    // Fetch all guild members
    await guild.members.fetch();
    
    // Get the role to remove
    const roleToRemove = guild.roles.cache.get(roleId);
    if (!roleToRemove) {
        throw new Error(`Role with ID ${roleId} not found.`);
    }
    
    // Get members with the role
    const membersWithRole = guild.members.cache.filter(member => 
        member.roles.cache.has(roleId)
    );
    
    // Remove the role from each member
    let removedCount = 0;
    for (const [_, member] of membersWithRole) {
        try {
            await member.roles.remove(roleToRemove);
            removedCount++;
        } catch (error) {
            console.error(`Failed to remove role from ${member.user.tag}:`, error);
        }
    }
    
    return removedCount;
}
