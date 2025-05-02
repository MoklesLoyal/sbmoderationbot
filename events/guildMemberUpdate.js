const { Events } = require('discord.js');
const { updatePureCounter } = require('../utils/roleCounter');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        try {
            // Check if this is the target guild
            if (newMember.guild.id !== '374971715626991626') return;
            
            const pureRoleId = '863277258395484160';
            
            // Check if the Pure role was added or removed
            const hadRole = oldMember.roles.cache.has(pureRoleId);
            const hasRole = newMember.roles.cache.has(pureRoleId);
            
            // If role status changed, update the counter
            if (hadRole !== hasRole) {
                await updatePureCounter(newMember.guild);
            }
        } catch (error) {
            console.error('Error in guildMemberUpdate event:', error);
        }
    }
};
