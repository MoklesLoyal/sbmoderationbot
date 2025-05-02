const { Events } = require('discord.js');
const { updateUserAura } = require('../utils/auraSystem');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        // Partial reactions need to be fetched to access their properties
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Error fetching reaction:', error);
                return;
            }
        }

        // Get the message
        const message = reaction.message;
        if (message.partial) {
            try {
                await message.fetch();
            } catch (error) {
                console.error('Error fetching message:', error);
                return;
            }
        }
        
        // Skip if the message is from the bot itself
        if (message.author.bot) return;

        // Update aura for message author based on removed reaction
        // Pass messageId, authorId, reactorId, and reaction name
        updateUserAura(
            message.id,
            message.author.id,
            user.id,
            reaction.emoji.name,
            false
        );
    },
};
