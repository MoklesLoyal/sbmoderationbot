const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue'),
    async execute(interaction) {
        const queue = queues.get(interaction.guildId);
        
        if (!queue || !queue.songs.length) {
            return interaction.reply('No songs in queue!');
        }

        const embed = new EmbedBuilder()
            .setTitle('Music Queue')
            .setDescription(queue.songs
                .map((song, index) => `${index + 1}. ${song.title}`)
                .join('\n'))
            .setColor('#FF0000');

        await interaction.reply({ embeds: [embed] });
    }
};
