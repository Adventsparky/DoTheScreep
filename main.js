const roleManager=require('role.manager');
const Tasks=require('tasks');
const manCave=Game.spawns.Bastion;
const availableSources=manCave.room.find(FIND_SOURCES);

module.exports.loop = function () {

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    console.log(availableSources);
    for(let sourceNum in availableSources) {
        if(availableSources.hasOwnProperty(sourceNum)){
            console.log(sourceNum);
            console.log(availableSources[sourceNum]);
            console.log(availableSources[sourceNum].id);
            let source=availableSources[sourceNum];
            if (Memory.sources === undefined) {
                Memory.sources={};
            }
            if (Memory.sources[source.id] === undefined) {
                Memory.sources[source.id] = {};
                Memory.sources[source.id].dedicatedMiner = 0;
            }
            if (Memory.sources){
                console.log(Memory.sources);
            }
        }
    }

    for(let name in Game.creeps) {
        if(Game.creeps.hasOwnProperty(name)) {
            let creep = Game.creeps[name];
            console.log(roleManager[creep]);
            console.log(roleManager[creep.memory]);
            console.log(roleManager[creep.memory.role]);
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