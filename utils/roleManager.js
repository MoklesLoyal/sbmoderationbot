const fs = require('fs');
const path = require('path');

const ROLES_FILE = path.join(__dirname, '../data/custom_roles.json');

function loadRoles() {
    if (!fs.existsSync(ROLES_FILE)) {
        fs.writeFileSync(ROLES_FILE, '{}');
        return {};
    }
    return JSON.parse(fs.readFileSync(ROLES_FILE));
}

function saveRoles(roles) {
    fs.writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2));
}

module.exports = {
    getRoleData: async (guild, userId) => {
        const roles = loadRoles();
        return roles[userId] || null;
    },

    saveRoleData: async (guild, userId, roleId) => {
        const roles = loadRoles();
        roles[userId] = { roleId };
        saveRoles(roles);
    }
};
