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
            let source=availableSources[sourceNum];
            if (Memory.sources === undefined) {
                Memory.sources={};
            }
            if (Memory.sources[source.id] === undefined ||
                Memory.sources[source.id].dedicatedMiner === undefined) {
                Memory.sources[source.id] = {};
                Memory.sources[source.id].dedicatedMiner = 0;
            }
            if (Memory.sources && Memory.sources[source.id]){
                console.log(Memory.sources[source.id]);
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