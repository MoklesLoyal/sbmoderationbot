const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),
    async execute(interaction) {
        const commands = interaction.client.commands;
        
        const commandNames = [];
        const commandDescriptions = [];
        
        commands.forEach(cmd => {
            commandNames.push(`\`/${cmd.data.name}\``);
            commandDescriptions.push(cmd.data.description);
        });

        const embed = new EmbedBuilder()
            .setTitle('📚 Command List')
            .setColor('#0099ff')
            .addFields(
                { name: 'Commands', value: commandNames.join('\n'), inline: true },
                { name: 'Description', value: commandDescriptions.join('\n'), inline: true }
            )
            .setFooter({ text: 'Use /command to execute a command' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
