const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const playlistsPath = './data/playlists.json';
let playlists = {};

if (fs.existsSync(playlistsPath)) {
    playlists = JSON.parse(fs.readFileSync(playlistsPath));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage playlists')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add current song to a playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a playlist')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Playlist name')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const name = interaction.options.getString('name');
        const userId = interaction.user.id;

        switch (subcommand) {
            case 'create':
                if (!playlists[userId]) playlists[userId] = {};
                playlists[userId][name] = [];
                fs.writeFileSync(playlistsPath, JSON.stringify(playlists, null, 2));
                await interaction.reply(`Created playlist: ${name}`);
                break;

            case 'add':
                const queue = queues.get(interaction.guildId);
                if (!queue?.songs[0]) {
                    return interaction.reply('No song currently playing!');
                }
                if (!playlists[userId]?.[name]) {
                    return interaction.reply('Playlist not found!');
                }
                playlists[userId][name].push(queue.songs[0]);
                fs.writeFileSync(playlistsPath, JSON.stringify(playlists, null, 2));
                await interaction.reply(`Added ${queue.songs[0].title} to ${name}`);
                break;

            case 'play':
                if (!playlists[userId]?.[name]) {
                    return interaction.reply('Playlist not found!');
                }
                const playlistSongs = playlists[userId][name];
                for (const song of playlistSongs) {
                    const command = interaction.client.commands.get('play');
                    await command.execute({
                        ...interaction,
                        options: { getString: () => song.url }
                    });
                }
                await interaction.reply(`Playing playlist: ${name}`);
                break;
        }
    }
};
