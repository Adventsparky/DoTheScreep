var roleManager=require('role.manager');
var manCave=Game.spawns.Bastion;
var Tasks=require('tasks');

module.exports.loop = function () {

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleManager[creep.memory.role].run(creep);
    }

    for(var role in roleManager) {
        if(!Tasks.performCreepleCensusByRole(roleManager[role])) {
            break;
        }
    }
};