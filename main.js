const roleManager=require('role.manager');
const Tasks=require('tasks');
const manCave=Game.spawns.Bastion;

module.exports.loop = function () {

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    console.log(manCave.room.find(FIND_SOURCES));

    for(let name in Game.creeps) {
        if(Game.creeps.hasOwnProperty(name)) {
            let creep = Game.creeps[name];
            roleManager[creep.memory.role].run(creep);
        }
    }

    for(let role in roleManager) {
        if(roleManager.hasOwnProperty(role)) {
            if (!Tasks.performCreepleCensusByRole(roleManager[role])) {
                break;
            }
        }
    }
};