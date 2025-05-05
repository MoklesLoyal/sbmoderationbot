    const { Events, EmbedBuilder, WebhookClient } = require('discord.js');
    const { logChannelId } = require('../config/logchannel.json');
    const { incrementUserMessages } = require('../utils/auraSystem');

    const webhook = new WebhookClient({ url: 'https://discord.com/api/webhooks/1322547718312300625/rLJoR84TVDMaUPwszsLuXsqVMOJhNlCDso_4YT3nCLCdggN1kW4btmm0Ttq96RPgIOYR' });

    const badWordsRegex = {
        slurs: /\b(n+[i1]+g+[ge3]+r+|f+a+g+[o0]+t+)\b/gi,
    };

    // Regex for detecting "gorlock the destroyer" with gif
    const gorlockRegex = /gorlock.*the.*destroyer.*gif|gif.*gorlock.*the.*destroyer/i;

    module.exports = {
        name: Events.MessageCreate,
        async execute(message) {
            if (message.author.bot) return;

            // Increment message count for aura system
            incrementUserMessages(message.author.id);

            // Webhook handling
            if (message.channelId === '1311643540903956520') {
                const messageOptions = {
                    content: message.content,
                    username: 'Sharkbrew Announcement',
                    files: Array.from(message.attachments.values()),
                    embeds: message.embeds,
                    components: message.components,
                    stickers: message.stickers
                };
            
                await webhook.send(messageOptions);
            }

            // Check for "gorlock the destroyer" with "gif"
            if (gorlockRegex.test(message.content.toLowerCase())) {
                try {
                    await message.delete();
                    const warningMessage = await message.channel.send({
                        content: `${message.author}, your message about Gorlock the Destroyer with a GIF was automatically removed.`,
                    });

                    setTimeout(() => warningMessage.delete().catch(() => {}), 5000);
                
                    // Log the deletion
                    const logChannel = message.guild?.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                            .setThumbnail(message.author.displayAvatarURL())
                            .setColor('#FF9900')
                            .setTitle('Gorlock Message Filtered')
                            .addFields(
                                { name: 'Author', value: `<@${message.author.id}>`, inline: true },
                                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                                { name: 'Message Content', value: message.content }
                            )
                            .setFooter({ text: `User ID: ${message.author.id}` })
                            .setTimestamp();

                        await logChannel.send({ embeds: [embed] });
                    }
                
                    return;
                } catch (error) {
                    console.error('Error handling Gorlock message:', error);
                }
            }

            // Check for #_ prefix restriction
            if (message.content.startsWith('# ' && '## ') && message.guildId === '374971715626991626') {
                // Check if user has the staff role
                const isStaff = message.member.roles.cache.has('689147294649679894');
            
                if (!isStaff) {
                    try {
                        await message.delete();
                        const warningMessage = await message.channel.send({
                            content: `${message.author}, Try retyping it without the \`\`#_\`\` in front.`,
                        });

                        setTimeout(() => warningMessage.delete().catch(() => {}), 5000);
                        return;
                    } catch (error) {
                        console.error('Error handling #_ message restriction:', error);
                    }
                }
            }

            // Bad words checking
            let containsBadWord = false;
            let matchedWords = [];

            for (const [category, regex] of Object.entries(badWordsRegex)) {
                const matches = message.content.match(regex);
                if (matches) {
                    containsBadWord = true;
                    matchedWords.push(...matches);
                }
            }

            if (containsBadWord) {
                try {
                    await message.delete();

                    const logChannel = message.guild?.channels.cache.get(logChannelId);
                    if (!logChannel) return;

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                        .setThumbnail(message.author.displayAvatarURL())
                        .setColor('#FF0000')
                        .setTitle('Message Filtered')
                        .addFields(
                            { name: 'Author', value: `<@${message.author.id}>`, inline: true },
                            { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                            { name: 'Filtered Words', value: matchedWords.join(', '), inline: true },
                            { name: 'Message Content', value: message.content }
                        )
                        .setFooter({ text: `User ID: ${message.author.id}` })
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });

                    const warningMessage = await message.channel.send({
                        content: `${message.author}, your message was removed for containing inappropriate language or content. Please review our community guidelines and refrain from using such language in the future.`,
                    });

                    setTimeout(() => warningMessage.delete().catch(() => {}), 5000);
                } catch (error) {
                    console.error('Error in message filtering:', error);
                }
            }
        }
    };