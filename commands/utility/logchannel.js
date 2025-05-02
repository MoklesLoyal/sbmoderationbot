const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logchannel')
        .setDescription('Enable or disable message logging')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable message logging')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to send logs to')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable message logging')),
                
    async execute(interaction) {
        const configPath = path.join(process.cwd(), 'config', 'serverConfig.json');
        let config;
        
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            config = { servers: {} };
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'enable') {
            const logChannel = interaction.options.getChannel('channel');
            
            config.servers[interaction.guildId] = {
                enabled: true,
                logChannelId: logChannel.id
            };

            await interaction.reply({ content: `Logging has been enabled in ${logChannel}!`, ephemeral: true });
        } else if (subcommand === 'disable') {
            if (config.servers[interaction.guildId]) {
                config.servers[interaction.guildId].enabled = false;
            }

            await interaction.reply({ content: 'Logging has been disabled!', ephemeral: true });
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    },
};