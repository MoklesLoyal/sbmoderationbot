const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user for a specified duration')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (e.g., 30s, 5m, 2h, 7d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)),
    async execute(interaction) {
        const target = interaction.options.getMember('user');
        const durationString = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        
        // Parse duration
        const durationMs = parseDuration(durationString);
        
        if (durationMs === null) {
            return interaction.reply({ 
                content: 'Invalid duration format. Use format like: 30s, 5m, 2h, 7d', 
                ephemeral: true 
            });
        }
        
        // Check if duration exceeds 28 days (Discord's maximum timeout period)
        const maxTimeoutMs = 28 * 24 * 60 * 60 * 1000; // 28 days in milliseconds
        if (durationMs > maxTimeoutMs) {
            return interaction.reply({ 
                content: 'Timeout duration cannot exceed 28 days', 
                ephemeral: true 
            });
        }
        
        try {
            await target.timeout(durationMs, reason);
            
            // Create embed
            const timeoutEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('User Timeout')
                .setDescription(`${target.user.tag} has been timed out`)
                .addFields(
                    { name: 'User', value: `<@${target.id}>`, inline: true },
                    { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Duration', value: formatDuration(durationMs), inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();
            
            // Reply in the channel where command was used
            await interaction.reply({ embeds: [timeoutEmbed] });
            
            // Send to log channels
            const logChannelIds = ['466139409830641674', '874490050497355776'];
            for (const channelId of logChannelIds) {
                const channel = interaction.client.channels.cache.get(channelId);
                if (channel) {
                    await channel.send({ embeds: [timeoutEmbed] });
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error trying to timeout this user. Make sure I have the proper permissions.', 
                ephemeral: true 
            });
        }
    }
};

// Helper function to parse duration string into milliseconds
function parseDuration(durationString) {
    const regex = /^(\d+)([smhd])$/;
    const match = durationString.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000; // seconds
        case 'm': return value * 60 * 1000; // minutes
        case 'h': return value * 60 * 60 * 1000; // hours
        case 'd': return value * 24 * 60 * 60 * 1000; // days
        default: return null;
    }
}

// Helper function to format duration in a readable format
function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    
    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    
    return parts.join(', ');
}
