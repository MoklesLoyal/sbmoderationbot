const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Role IDs for Crafter and Writer of the Month
const CRAFTER_ROLE_ID = '874510046208360459';
const WRITER_ROLE_ID = '876370089987952700';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('award')
        .setDescription('Manage Crafter/Writer of the Month roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('cwcotm')
                .setDescription('Assign Crafter of the Month role to users with a specific role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role whose members will receive Crafter of the Month')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('wcotm')
                .setDescription('Assign Writer of the Month role to users with a specific role')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role whose members will receive Writer of the Month')
                        .setRequired(true)
                )
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
        const targetRole = interaction.options.getRole('role');
        
        try {
            if (subcommand === 'cwcotm') {
                await assignRoleToMembers(interaction, targetRole.id, CRAFTER_ROLE_ID);
                await interaction.editReply(`Successfully assigned Crafter of the Month to members with the ${targetRole.name} role.`);
            } else if (subcommand === 'wcotm') {
                await assignRoleToMembers(interaction, targetRole.id, WRITER_ROLE_ID);
                await interaction.editReply(`Successfully assigned Writer of the Month to members with the ${targetRole.name} role.`);
            }
        } catch (error) {
            console.error('Error assigning roles:', error);
            await interaction.editReply('An error occurred while assigning roles.');
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