const color_list = require("../options/roles.json").colors;

module.exports = {
    name: 'teamcolor',
    guild: true,
    run(message, args) {
        author = message.member;
        colorId = args.teamcolor.stringValue;
        if (!color_list.hasOwnProperty(colorId)) {
            // Team color not found in list
            return;
        }

        // Check user's current team colors
        userRoles = author.roles.array();
        userRoles.forEach(color => {
            // User is already on a team, remove it
            if (color_list.hasOwnProperty(color.id)) {
                console.log("Removing team " + color.name);
                author.removeRole(color.id);
                return;
            }
        });
        author.setRoles([colorId]).catch(console.error);
    }
};