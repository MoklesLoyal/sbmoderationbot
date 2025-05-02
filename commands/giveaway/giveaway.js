const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const ms = require('ms');

// Store active giveaways
const activeGiveaways = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Create a giveaway with customizable options'),

    async execute(interaction) {
        // Check for required role
        if (!interaction.member.roles.cache.has('689147294649679894')) {
            return await interaction.reply({
                content: 'You need the appropriate role to use this command.',
                ephemeral: true
            });
        }

        // Create modal
        const modal = new ModalBuilder()
            .setCustomId('giveawayModal')
            .setTitle('Create a Giveaway');

        // Add input fields
        const hostInput = new TextInputBuilder()
            .setCustomId('hostInput')
            .setLabel('Host')
            .setPlaceholder('Enter the host name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const prizeInput = new TextInputBuilder()
            .setCustomId('prizeInput')
            .setLabel('Prize')
            .setPlaceholder('Enter the prize')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('durationInput')
            .setLabel('Duration (s/m/h/d/w)')
            .setPlaceholder('Example: 1d for 1 day')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('winnersInput')
            .setLabel('Number of Winners')
            .setPlaceholder('Enter number of winners')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('descriptionInput')
            .setLabel('Description')
            .setPlaceholder('Enter giveaway description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // Add inputs to modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(hostInput),
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(winnersInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);

        // Handle modal submission
        const filter = (i) => i.customId === 'giveawayModal';
        try {
            const modalResponse = await interaction.awaitModalSubmit({ filter, time: 300000 });
            const host = modalResponse.fields.getTextInputValue('hostInput');
            const prize = modalResponse.fields.getTextInputValue('prizeInput');
            const duration = ms(modalResponse.fields.getTextInputValue('durationInput'));
            const winners = parseInt(modalResponse.fields.getTextInputValue('winnersInput'));
            const description = modalResponse.fields.getTextInputValue('descriptionInput');

            const endTime = Date.now() + duration;

            const button = new ButtonBuilder()

                .setCustomId(`giveaway_enter_${endTime}`)
                .setLabel('🎉 Enter Giveaway')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            const embed = new EmbedBuilder()
                .setTitle('🎉 GIVEAWAY 🎉')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Host', value: host, inline: true },
                    { name: 'Prize', value: prize, inline: true },
                    { name: 'Winners', value: winners.toString(), inline: true },
                    { name: 'Description', value: description },
                    { name: 'Ends', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: 'Click the button below to enter!' });


            const message = await modalResponse.reply({ embeds: [embed], components: [row], fetchReply: true });



            // Store giveaway data
            activeGiveaways.set(endTime, {
                messageId: message.id,
                channelId: message.channelId,
                participants: new Set(),
                prize,
                winners: winners,
                host,
                description,
                endTime
            });

            // Set timer for giveaway end
            setTimeout(async () => {
                const giveaway = activeGiveaways.get(endTime);
                if (!giveaway) return;

                const channel = interaction.guild.channels.cache.get(giveaway.channelId);
                const giveawayMessage = await channel.messages.fetch(giveaway.messageId);

                // Convert participants Set to Array for random selection
                const participantsArray = Array.from(giveaway.participants);
                const winnerCount = Math.min(giveaway.winners, participantsArray.length);
                const winners = [];

                // Select random winners
                for (let i = 0; i < winnerCount; i++) {
                    const winnerIndex = Math.floor(Math.random() * participantsArray.length);
                    winners.push(participantsArray.splice(winnerIndex, 1)[0]);
                }

                // Update embed with winners
                const winnerEmbed = EmbedBuilder.from(giveawayMessage.embeds[0])
                    .addFields({ 
                        name: '🎉 Winners', 
                        value: winners.length > 0 
                            ? winners.map(id => `<@${id}>`).join(', ')
                            : 'No valid participants'
                    })
                    .setColor('#00FF00');

                // Update embed with new participant count
                const participantEmbed = EmbedBuilder.from(i.message.embeds[0])
                    .spliceFields(-1, 0, { 
                        name: 'Participants', 
                        value: giveaway.participants.size.toString(), 
                        inline: true 
                    });





                await i.message.edit({ embeds: [participantEmbed] });





                await i.reply({ content: 'You have entered the giveaway!', ephemeral: true });
                // Announce winners
                if (winners.length > 0) {
                    await channel.send({
                        content: `Congratulations ${winners.map(id => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**! 🎉`,
                        allowedMentions: { users: winners }
                    });
                } else {
                    await channel.send('No one participated in the giveaway 😔');
                }

                // Remove giveaway from active giveaways
                activeGiveaways.delete(endTime);
            }, duration);

            // Create button interaction collector
            const collector = message.createMessageComponentCollector({
                filter: i => i.customId === `giveaway_enter_${endTime}`,
                time: duration
            });

            collector.on('collect', async (i) => {
                const giveaway = activeGiveaways.get(endTime);
                if (!giveaway) return;

                if (giveaway.participants.has(i.user.id)) {
                    await i.reply({ 
                        content: 'You have already entered this giveaway!', 
                        ephemeral: true 
                    });
                    return;
                }

                giveaway.participants.add(i.user.id);

                // Update embed with new participant count
                const participantEmbed = EmbedBuilder.from(i.message.embeds[0])
                    .spliceFields(-1, 0, { 
                        name: 'Participants', 
                        value: giveaway.participants.size.toString(), 
                        inline: true 
                    });

                await i.message.edit({ embeds: [participantEmbed] });

                            // Disable the button
                            const disabledButton = ButtonBuilder.from(giveawayMessage.components[0].components[0])
                                .setDisabled(true);
                            const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

                            await giveawayMessage.edit({ 
                                embeds: [updatedEmbed], 
                                components: [disabledRow] 
                            });
                
                await i.reply({ 
                    content: 'You have entered the giveaway! Good luck! 🍀', 
                    ephemeral: true 
                });
            });

        } catch (error) {
            console.error(error);
        }
    },

};