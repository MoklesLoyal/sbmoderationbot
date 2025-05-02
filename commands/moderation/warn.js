const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const warningsPath = './data/warnings.json';
let warnings = {};

try {
    if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
    }
    
    if (!fs.existsSync(warningsPath)) {
        fs.writeFileSync(warningsPath, '{}', { encoding: 'utf8' });
    }
    
    const fileContent = fs.readFileSync(warningsPath, { encoding: 'utf8' });
    warnings = JSON.parse(fileContent || '{}');
} catch (error) {
    warnings = {};
    fs.writeFileSync(warningsPath, '{}', { encoding: 'utf8' });
}

function getTimeoutDuration(warningCount) {
    if (warningCount === 1) return 0; // Verbal warning
    if (warningCount === 2) return 15 * 60 * 1000; // 15 minutes
    if (warningCount >= 3 && warningCount <= 4) return 60 * 60 * 1000; // 1 hour
    if (warningCount >= 5 && warningCount <= 6) return 24 * 60 * 60 * 1000; // 24 hours
    if (warningCount >= 7 && warningCount <= 9) return 7 * 24 * 60 * 60 * 1000; // 1 week
    if (warningCount >= 10) return 28 * 24 * 60 * 60 * 1000; // 28 days
    return 0;
}

function getTimeoutText(warningCount) {
    if (warningCount === 1) return "Verbal Warning";
    if (warningCount === 2) return "15 minute timeout";
    if (warningCount >= 3 && warningCount <= 4) return "1 hour timeout";
    if (warningCount >= 5 && warningCount <= 6) return "24 hours timeout";
    if (warningCount >= 7 && warningCount <= 9) return "1 week timeout";
    if (warningCount >= 10) return "28 days timeout";
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a member')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The member to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for warning')
                .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const member = await interaction.guild.members.fetch(target.id);
        const logChannel = interaction.guild.channels.cache.get('466139409830641674');
        
        if (!warnings[target.id]) {
            warnings[target.id] = {
                warnings: [],
                totalWarnings: 0
            };
        }
        
        const warning = {
            reason,
            moderator: interaction.user.id,
            timestamp: Date.now(),
            warningId: uuidv4()
        };
        
        warnings[target.id].warnings.push(warning);
        warnings[target.id].totalWarnings++;
        
        const warningCount = warnings[target.id].totalWarnings;
        const timeoutDuration = getTimeoutDuration(warningCount);
        const timeoutText = getTimeoutText(warningCount);
        
        if (timeoutDuration > 0) {
            await member.timeout(timeoutDuration, `Automated timeout - Warning #${warningCount}`);
        }
        
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
        
        const embed = new EmbedBuilder()
            .setTitle('Warning Issued')
            .setColor('#FF4444')
            .setFields([
                { name: 'User', value: `${target.tag}` },
                { name: 'Reason', value: reason },
                { name: 'Warning ID', value: warning.warningId },
                { name: 'Total Warnings', value: `${warnings[target.id].totalWarnings}` },
                { name: 'Action Taken', value: timeoutText }
            ])
            .setTimestamp();
        
        // Send to both channels
        await interaction.reply({ embeds: [embed] });
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    }
};