const { google } = require("googleapis");
const ytdl = require('ytdl-core');
const ytSerach = require('yt-search');
const { joinVoiceChannel, NoSubscriberBehavior } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const queue = new Map();

module.exports = async (msg, args) => {
    if (args.lenght <= 0) return msg.channel.send('Sem música não tem o que pesquisar né meu cria.');

    const voiceChannel = msg.member.voice.channel;

    if (!voiceChannel) return msg.channel.send('ENTRA NA PORRA DO CANAL PRA USAR ISSO!');
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has('CONNECT')) return msg.channel.send('Sem permissão para conectar');
    if (!permissions.has('SPEAK')) return msg.channel.send('Sem permissão para falar');

    const server_queue = queue.get(msg.guild.id);
    let song = {};

    if (ytdl.validateURL(args[0])) {
        const song_info = await ytdl.getInfo(args[0]);
        song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url }
    } else {
        const videoFinder = async (query) => {
            const videoResult = await ytSerach(query);
            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
        }

        const video = await videoFinder(args.join(' '));

        if (video) {
            song = { title: video.title, url: video.url }
        } else {
            msg.channel.send('Escreve direito que não deu pra achar não.')
        }
    }

    if (!server_queue) {
        const queueConst = {
            voice_channel: voiceChannel,
            text_channel: msg.channel,
            connection: null,
            songs: []
        }

        queue.set(msg.guild.id, queueConst);
        queueConst.songs.push(song);

        try {
            const conn = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            });

            queueConst.connection = conn;
            videoPlayer(msg.guild, queueConst.songs[0]);
        } catch (err) {
            queue.delete(msg.guild.id);
            msg.channel.send('Se pa que num foi não.')
            throw err;
        }
    } else {
        queue.songs.push(song);
        return msg.channel.send(`${song.title} adicionado a fila!`)
    }
}

const videoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } })

    if (!song) {
        songQueue.voice_channel.destroy();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const audio = createAudioResource(song.url);
    player.play(audio);
    songQueue.connection.subscribe(player);
    player.on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    });
}