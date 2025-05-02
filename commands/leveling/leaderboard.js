const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the server leaderboard'),
    async execute(interaction) {
        const usersPath = path.join(__dirname, '../../users');
        const userFiles = fs.readdirSync(usersPath).filter(file => file.endsWith('.json'));
        
        const users = userFiles.map(file => {
            const userData = JSON.parse(fs.readFileSync(path.join(usersPath, file)));
            return {
                id: file.replace('.json', ''),
                level: userData.level,
                xp: userData.xp
            };
        });
          const sortedUsers = users
              .sort((a, b) => (b.level * 1000 + b.xp) - (a.level * 1000 + a.xp))
              .slice(0, 10);

          const ranks = [];
          const levels = [];
          const exp = [];

          await Promise.all(sortedUsers.map(async (userData, index) => {
              const user = await interaction.client.users.fetch(userData.id);
              ranks.push(`#${index + 1} ${user.username}`);
              levels.push(`Level ${userData.level}`);
              exp.push(`${userData.xp} XP`);
          }));

          const embed = new EmbedBuilder()
              .setTitle('🏆 Server Leaderboard')
              .setColor('#FFD700')
              .addFields(
                  { name: 'Rank & Name', value: ranks.join('\n'), inline: true },
                  { name: 'Level', value: levels.join('\n'), inline: true },
                  { name: 'Experience', value: exp.join('\n'), inline: true }
              )
              .setTimestamp();
        
          await interaction.reply({ embeds: [embed] });
      }
  };
