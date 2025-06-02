  const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
  const { Player } = require('discord-player');
  const fs = require('fs');
  const path = require('path');
  const config = require('./config/config.json');

  // Path to users directory
  const usersPath = path.join(__dirname, 'users');

  // Create users directory if it doesn't exist
  if (!fs.existsSync(usersPath)) {
      fs.mkdirSync(usersPath, { recursive: true });
  }

  function getUserData(userId) {
      const userPath = path.join(usersPath, `${userId}.json`);
      if (!fs.existsSync(userPath)) {
          const defaultData = {
              balance: 0,
              xp: 0,
              level: 1,
              messageCount: 0,
              lastDaily: null
          };
          fs.writeFileSync(userPath, JSON.stringify(defaultData, null, 2));
          return defaultData;
      }
    
      try {
          const data = fs.readFileSync(userPath, 'utf8');
          if (data.trim()) {
              return JSON.parse(data);
          } else {
              // File is empty, return default data
              const defaultData = {
                  balance: 0,
                  xp: 0,
                  level: 1,
                  messageCount: 0,
                  lastDaily: null
              };
              fs.writeFileSync(userPath, JSON.stringify(defaultData, null, 2));
              return defaultData;
          }
      } catch (error) {
          console.error(`Error parsing user data for ${userId}, creating new file:`, error.message);
          const defaultData = {
              balance: 0,
              xp: 0,
              level: 1,
              messageCount: 0,
              lastDaily: null
          };
          fs.writeFileSync(userPath, JSON.stringify(defaultData, null, 2));
          return defaultData;
      }
  }

  function saveUserData(userId, data) {
      const userPath = path.join(usersPath, `${userId}.json`);
      try {
          fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
      } catch (error) {
          console.error(`Error saving user data for ${userId}:`, error.message);
      }
  }

  const client = new Client({
      intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildBans,
          GatewayIntentBits.GuildEmojisAndStickers,
          GatewayIntentBits.GuildIntegrations,
          GatewayIntentBits.GuildWebhooks,
          GatewayIntentBits.GuildInvites,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildPresences,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.GuildMessageTyping,
          GatewayIntentBits.MessageContent
      ]
  });
  // Initialize the player
  client.player = new Player(client);
  client.commands = new Collection();

  // Load commands
  const commands = [];
  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder);
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      for (const file of commandFiles) {
          const filePath = path.join(commandsPath, file);
          const command = require(filePath);
          if ('data' in command && 'execute' in command) {
              client.commands.set(command.data.name, command);
              commands.push(command.data.toJSON());
          }
      }
  }

  // Deploy commands on startup
  const rest = new REST().setToken(config.token);

  async function deployCommands() {
      try {
          console.log(`Started refreshing ${commands.length} application (/) commands.`);

          const data = await rest.put(
              Routes.applicationCommands(config.clientId),
              { body: commands },
          );

          console.log(`Successfully reloaded ${data.length} application (/) commands.`);
      } catch (error) {
          console.error(error);
      }
  }

  client.once('ready', async () => {
      console.log(`Logged in as ${client.user.tag}!`);
      await deployCommands();
  });

  client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
          await command.execute(interaction);
      } catch (error) {
          console.error(error);
          await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
      }
  });

  // Add XP and count messages
  client.on('messageCreate', message => {
      if (message.author.bot) return;
      if (message.guild.id !== '374971715626991626') return;
    
      const userId = message.author.id;
      const userData = getUserData(userId);
    
      userData.messageCount++;
      userData.xp += Math.floor(Math.random() * 10) + 15;
      const xpNeeded = userData.level * 100;
    
      if (userData.xp >= xpNeeded) {
          const oldLevel = userData.level;
          userData.level++;
          userData.xp = 0;
        
          // Send message only for levels divisible by 5
          if (userData.level % 5 === 0) {
              message.channel.send(`🎉 Amazing achievement ${message.author}! You've reached level ${userData.level}!🎊`);
          }
      }
    
      saveUserData(userId, userData);
  });

  client.login(config.token);

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
