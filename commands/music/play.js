const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice');
const youtubeDl = require('youtube-dl-exec');
const ytSearch = require('yt-search');
const { createReadStream } = require('fs');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

const queues = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or URL')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel!');
        }

        await interaction.deferReply();
        const query = interaction.options.getString('query');

        try {
            let videoUrl;
            if (query.startsWith('https://')) {
                videoUrl = query;
            } else {
                const results = await ytSearch(query);
                if (!results?.videos.length) {
                    return interaction.editReply('No songs found!');
                }
                videoUrl = results.videos[0].url;
            }

            const songInfo = await youtubeDl(videoUrl, {
                format: 'bestaudio',
                dumpSingleJson: true,
                extractAudio: true,
                audioFormat: 'mp3'
            });

            const song = {
                title: songInfo.title,
                url: songInfo.url,
                audioUrl: songInfo.formats[0].url
            };

            let queueConstruct = queues.get(interaction.guildId);
            if (!queueConstruct) {
                const player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Play
                    }
                });

                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator
                });

                queueConstruct = {
                    textChannel: interaction.channel,
                    voiceChannel: interaction.member.voice.channel,
                    connection: connection,
                    player: player,
                    songs: [],
                    playing: false
                };

                connection.subscribe(player);
                queues.set(interaction.guildId, queueConstruct);
            }

            queueConstruct.songs.push(song);

            if (!queueConstruct.playing) {
                await playNext(interaction.guild, queueConstruct.songs[0]);
                queueConstruct.playing = true;
            }

            return interaction.editReply(`Added to queue: **${song.title}**`);

        } catch (error) {
            console.error(error);
            return interaction.editReply('There was an error while executing this command!');
        }
    }
};

async function playNext(guild, song) {
    const queueConstruct = queues.get(guild.id);

    if (!song) {
        queueConstruct.connection.destroy();
        queues.delete(guild.id);
        return;
    }

    try {
        const { stdout } = await exec(`yt-dlp -f bestaudio -o - "${song.url}" | ffmpeg -i pipe:0 -f mp3 -`);
        const resource = createAudioResource(stdout);
        
        queueConstruct.player.play(resource);

        queueConstruct.player.on(AudioPlayerStatus.Idle, () => {
            queueConstruct.songs.shift();
            playNext(guild, queueConstruct.songs[0]);
        });

        queueConstruct.textChannel.send(`Now playing: **${song.title}**`);
    } catch (error) {
        console.error(error);
        queueConstruct.textChannel.send('Error playing song!');
        queueConstruct.songs.shift();
        playNext(guild, queueConstruct.songs[0]);
    }
}