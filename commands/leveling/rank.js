const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData } = require('../../utils/userData.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Shows your current rank and XP'),
    async execute(interaction) {
        const userData = getUserData(interaction.user.id);
        const xpNeeded = userData.level * 100;
        const xpProgress = Math.min(userData.xp / xpNeeded * 10, 10);
        
        // Create dynamic XP bar
        const fullBar = '▰';
        const emptyBar = '▱';
        const progressBar = fullBar.repeat(Math.floor(xpProgress)) + emptyBar.repeat(10 - Math.floor(xpProgress));
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${interaction.user.username}'s Level Stats`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Level', value: `${userData.level}`, inline: true },
                { name: 'Total Messages', value: `${userData.messageCount}`, inline: true },
                { name: 'XP Progress', value: `${userData.xp}/${xpNeeded} XP` },
                { name: 'Progress Bar', value: `${progressBar} ${Math.floor((userData.xp / xpNeeded) * 100)}%` }
            )
            .setFooter({ text: `Keep chatting to level up!` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};