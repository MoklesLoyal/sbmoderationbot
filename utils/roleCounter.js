// Function to update the Pure counter in the channel name
async function updatePureCounter(guild) {
    try {
        // Get the target channel
        const targetChannel = await guild.channels.fetch('1135702103378104451');
        if (!targetChannel) {
            console.error('Target channel not found');
            return;
        }

        // Get the Pure role
        const pureRole = await guild.roles.fetch('863277258395484160');
        if (!pureRole) {
            console.error('Pure role not found');
            return;
        }

        // Count members with the Pure role
        const memberCount = pureRole.members.size;

        // Update channel name with the count
        await targetChannel.setName(`${memberCount}︱pures`);
        console.log(`Updated Pure counter channel to: ${memberCount}︱pures`);
    } catch (error) {
        console.error('Error updating Pure counter:', error);
    }
}

module.exports = { updatePureCounter };
