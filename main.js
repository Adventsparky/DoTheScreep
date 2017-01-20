const roleManager=require('role.manager');
const Tasks=require('tasks');
const manCave=Game.spawns.Bastion;

module.exports.loop = function () {

    // Set up some lists of things we might use more than once per tick
    Memory.availableSources=manCave.room.find(FIND_SOURCES);
    Memory.structures=manCave.room.find(FIND_STRUCTURES);

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    console.log(Memory.availableSources);
    for(let sourceNum in Memory.availableSources) {
        if(Memory.availableSources.hasOwnProperty(sourceNum)){
            let source=Memory.availableSources[sourceNum];
            if (source.dedicatedMiner === undefined) {
                source.dedicatedMiner = 0;
            }
            if (Memory.sources && Memory.sources[source.id]){
                console.log(Memory.sources[source.id]);
            }
        }
    }

    // Can we auto build available extensions?
    let test=Tasks.buildingTypeAvailable(STRUCTURE_EXTENSION);
    let test2=Tasks.buildingTypeAvailable(STRUCTURE_TOWER);
    console.log('extension available:'+test);
    console.log('tower available:'+test2);
    console.log('energy capacity: '+manCave.room.energyCapacityAvailable);
    console.log('energy: '+manCave.room.energyAvailable);

    // Basic tower code taken directly from tutorial
    let tower = Game.getObjectById('TOWER_ID');
    if(tower) {
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 10000 // todo remove hardcoded hits check for tower repair
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
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