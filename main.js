const roleManager=require('role.manager');
const Tasks=require('tasks');
const manCave=Game.spawns.Bastion;
const availableSources=Memory.manCave.room.find(FIND_SOURCES);

module.exports.loop = function () {

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    for(let source in availableSources) {
        if(availableSources.hasOwnProperty(source)){
            console.log(source);
            if (Memory.sources[source.id] === undefined) {
                Memory.sources[source.id] = source.id;
                Memory.sources[source.id].dedicatedMiners = 0;
                console.log(Memory.sources);
                return;
            }
        }
    }

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