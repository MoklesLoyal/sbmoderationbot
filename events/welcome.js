const { logChannelId, enabledChannels } = require('../config/logchannel.json');

const ALLOWED_GUILD_ID = "374971715626991626";

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        // Check if event is from the allowed server
        if (member.guild.id !== ALLOWED_GUILD_ID) return;

        const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
        if (!channel) return;

        const welcomeMessages = [
            `Welcome ${member} to the server! 🎉`,
            `${member} just joined! Everyone say hello! 👋`,
            `${member} has arrived! Let the party begin! 🎈`
        ];

        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        channel.send(randomMessage);
    }
};
