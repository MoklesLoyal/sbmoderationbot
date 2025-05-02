const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// BBQ message that will be posted every 15 minutes
const BBQ_MESSAGE = `It's been a while since we've had this, so welcome back to the BBQ!
ENJOY, BBQ STARTING NOW AND FINISHING WHEN TRIPS END GL HAVE FUN AND STAY SAFE!

1. No Posting DOX Images (Image sharing will be suspended for everyone if this occurs, don't ruin it for everyone else)
2. No Mass Tagging/Highlighting, this will result in a Temporary mute for the remaining duration of the BBQ.
3. No IRL threats, keep it in game, this will also result in a Temporary mute for the remaining duration of the BBQ.
4. No saying the N word in any variations.`;

// Store active BBQ channels and their interval IDs
const activeChannels = new Map();

// Required role ID
const REQUIRED_ROLE_ID = '689147294649679894';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bbq')
        .setDescription('Manage BBQ channels')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a BBQ channel with automated reminders'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('close')
                .setDescription('Close the BBQ channel by removing permissions')),

    async execute(interaction) {
        // Check if the user has the required role
        if (!interaction.member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return await interaction.reply({ 
                content: 'You do not have permission to use this command. You need the specific role to manage BBQ channels.', 
                ephemeral: true 
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'create') {
            await createBBQChannel(interaction);
        } else if (subcommand === 'close') {
            await closeBBQChannel(interaction);
        }
    },
};

async function createBBQChannel(interaction) {
    await interaction.deferReply();
    
    try {
        const guild = interaction.guild;
        const categoryId = '756225117188784178';
        const category = await guild.channels.fetch(categoryId);
        
        if (!category) {
            return await interaction.editReply('Category not found. Please check the category ID.');
        }
        
        // Check if BBQ channel already exists
        const existingChannel = guild.channels.cache.find(
            channel => channel.name === '🍖︱bbq' && channel.parentId === categoryId
        );
        
        if (existingChannel) {
            return await interaction.editReply(`A BBQ channel already exists: <#${existingChannel.id}>`);
        }
        
        // Create the channel
        const bbqChannel = await guild.channels.create({
            name: '🍖︱bbq',
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: category.permissionOverwrites.cache
        });
        
        // Send initial message
        await bbqChannel.send(BBQ_MESSAGE);
        
        // Set up interval for posting message every 15 minutes
        const intervalId = setInterval(async () => {
            try {
                await bbqChannel.send(BBQ_MESSAGE);
            } catch (error) {
                console.error('Failed to send BBQ reminder:', error);
                clearInterval(intervalId);
                activeChannels.delete(bbqChannel.id);
            }
        }, 15 * 60 * 1000); // 15 minutes
        
        // Store the channel and its interval
        activeChannels.set(bbqChannel.id, intervalId);
        
        await interaction.editReply(`BBQ channel created: <#${bbqChannel.id}>`);
    } catch (error) {
        console.error('Error creating BBQ channel:', error);
        await interaction.editReply('Failed to create BBQ channel. Please check my permissions and try again.');
    }
}

async function closeBBQChannel(interaction) {
    await interaction.deferReply();
    
    try {
        const guild = interaction.guild;
        const bbqChannel = guild.channels.cache.find(
            channel => channel.name === '🍖︱bbq'
        );
        
        if (!bbqChannel) {
            return await interaction.editReply('No BBQ channel found to close.');
        }
        
        // Remove permissions for everyone
        await bbqChannel.permissionOverwrites.edit(guild.roles.everyone, {
            SendMessages: false,
            AddReactions: false,
            UseExternalEmojis: false,
            UseApplicationCommands: false,
            SendMessagesInThreads: false,
            CreatePublicThreads: false,
            CreatePrivateThreads: false,
            AttachFiles: false,
            EmbedLinks: false
        });
        
        // Specifically deny permissions for the specified role
        const targetRoleId = '863277258395484160';
        const targetRole = await guild.roles.fetch(targetRoleId);
        
        if (targetRole) {
            await bbqChannel.permissionOverwrites.edit(targetRole, {
                SendMessages: false,
                AddReactions: false,
                UseExternalEmojis: false,
                UseApplicationCommands: false,
                SendMessagesInThreads: false,
                CreatePublicThreads: false,
                CreatePrivateThreads: false,
                AttachFiles: false,
                EmbedLinks: false
            });
        }
        
        // Stop the interval if it exists
        if (activeChannels.has(bbqChannel.id)) {
            clearInterval(activeChannels.get(bbqChannel.id));
            activeChannels.delete(bbqChannel.id);
        }
        
        // Send closing message
        await bbqChannel.send('**BBQ HAS ENDED. This channel is now closed.**');
        
        await interaction.editReply(`BBQ channel <#${bbqChannel.id}> has been closed.`);
    } catch (error) {
        console.error('Error closing BBQ channel:', error);
        await interaction.editReply('Failed to close BBQ channel. Please check my permissions and try again.');
    }
}
