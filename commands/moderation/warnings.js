const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const warningsPath = './data/warnings.json';
let warnings = {};

try {
    const data = fs.readFileSync(warningsPath, 'utf8');
    warnings = JSON.parse(data);
} catch {
    warnings = {};
    fs.writeFileSync(warningsPath, '{}', 'utf8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('Check warnings for a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to check warnings for')
                .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const userWarnings = warnings[target.id]?.warnings || [];
        
        const embed = new EmbedBuilder()
            .setTitle(`Warnings for ${target.tag}`)
            .setColor('#FF8800')
            .setDescription(userWarnings.length ? 
                userWarnings.map((w, i) => 
                    `${i + 1}. ${w.reason} (by <@${w.moderator}> on ${new Date(w.timestamp).toLocaleDateString()})`
                ).join('\n') : 
                'No warnings found');
        
        await interaction.reply({ embeds: [embed] });
    }
};