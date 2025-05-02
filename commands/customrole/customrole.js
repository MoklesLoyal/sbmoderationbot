const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viprole')
        .setDescription('Manage your custom Nitro Booster role')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create your vip custom role')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name for your vip custom role')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Hex color code (e.g., #FF0000)')
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option.setName('icon')
                        .setDescription('Icon for your role (optional)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Update your vip custom role')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('New name for your role')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('New hex color code (e.g., #FF0000)')
                        .setRequired(false))
                .addAttachmentOption(option =>
                    option.setName('icon')
                        .setDescription('New icon for your role')
                        .setRequired(false))),

    async execute(interaction) {
        // Check if user has Nitro Booster role
        const boosterRole = interaction.guild.roles.cache.get('585548349172875292');
        if (!interaction.member.roles.cache.has(boosterRole.id)) {
            return await interaction.reply({
                content: 'This command is only available for Nitro Boosters!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const customRoleData = await getRoleData(interaction.guild, userId);

        if (subcommand === 'create') {
            if (customRoleData) {
                return await interaction.reply({
                    content: 'You already have a vip custom role!',
                    ephemeral: true
                });
            }

            const name = interaction.options.getString('name');
            const color = interaction.options.getString('color');
            const icon = interaction.options.getAttachment('icon');

            try {
                const position = getPositionBetweenRoles(
                    interaction.guild,
                    '665905255388807168',
                    '374976993009336350'
                );

                const roleData = {
                    name: name,
                    color: color,
                    hoist: false,
                    mentionable: false,
                    permissions: '0',
                    position: position
                };

                if (icon) {
                    roleData.icon = icon.url;
                }

                const newRole = await interaction.guild.roles.create(roleData);
                await interaction.member.roles.add(newRole);
                await saveRoleData(interaction.guild, userId, newRole.id);

                await interaction.reply({
                    content: `Your vip custom role has been created! Role: ${newRole}`,
                    ephemeral: true
                });
            } catch (error) {
                await interaction.reply({
                    content: 'There was an error creating your role. Make sure the color code is valid!',
                    ephemeral: true
                });
            }
        } else if (subcommand === 'update') {
            if (!customRoleData) {
                return await interaction.reply({
                    content: 'You need to create a vip custom role first!',
                    ephemeral: true
                });
            }

            const role = interaction.guild.roles.cache.get(customRoleData.roleId);
            if (!role) {
                return await interaction.reply({
                    content: 'Your vip custom role could not be found!',
                    ephemeral: true
                });
            }

            const name = interaction.options.getString('name');
            const color = interaction.options.getString('color');
            const icon = interaction.options.getAttachment('icon');

            try {
                if (name) await role.setName(name);
                if (color) await role.setColor(color);
                if (icon) await role.setIcon(icon.url);

                await interaction.reply({
                    content: 'Your vip custom role has been updated!',
                    ephemeral: true
                });
            } catch (error) {
                await interaction.reply({
                    content: 'There was an error updating your role. Make sure the color code is valid!',
                    ephemeral: true
                });
            }
        }
    },
};

function getPositionBetweenRoles(guild, upperRoleId, lowerRoleId) {
    const upperRole = guild.roles.cache.get(upperRoleId);
    const lowerRole = guild.roles.cache.get(lowerRoleId);
    return Math.floor((upperRole.position + lowerRole.position) / 2);
}

const fs = require('fs')
const path = require('path')

async function getRoleData(guild, userId) {
    const filePath = path.join(__dirname, '../../data/customroles.json')
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
    }
    
    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}')
    }
    
    const data = JSON.parse(fs.readFileSync(filePath))
    return data[userId] || null
}
async function saveRoleData(guild, userId, roleId) {
    const filePath = path.join(__dirname, '../../data/customroles.json')
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
    }
    
    // Read existing data or create empty object
    const data = fs.existsSync(filePath) 
        ? JSON.parse(fs.readFileSync(filePath))
        : {}
    
    // Save the role ID for this user
    data[userId] = { roleId }
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
