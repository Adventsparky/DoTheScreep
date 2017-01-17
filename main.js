var roleManager=require('role.manager');
var manCave=Game.spawns.Bastion;
var Tasks=require('tasks');

function creepleCensusByRole(role) {
    var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
    if(creeps.length < role.min) {
        manCave.createCreep(role.parts,undefined, {role: role.role});
        return false;
    }
    return true;
}

module.exports.loop = function () {

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleManager[creep.memory.role].run(creep);
    }

    for(var role in roleManager) {
        if(!creepleCensusByRole(roleManager[role])) {
            break;
        }
    }
};