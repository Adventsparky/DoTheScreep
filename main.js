const RoleManager=require('role.manager');
const Tasks=require('tasks');
const Query=require('data');

module.exports.loop = function () {

    console.log('- - - NEW TICK - - -');

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    // Set up some lists of things we might use more than once per tick
    if(Memory.roomInfo == undefined) {
        Memory.roomInfo = {};
    }
    for(let roomId in Game.rooms){
        if(Game.rooms.hasOwnProperty(roomId)) {
            let thisRoom = Game.rooms[roomId];
            let storedRoom={};
            if(storedRoom == undefined) {
                storedRoom=Memory.roomInfo[thisRoom.name] = {};
            }

            // SOURCES
            let availableSources=storedRoom.availableSources=thisRoom.find(FIND_SOURCES);
            for(let sourceNum in availableSources) {
                if(availableSources.hasOwnProperty(sourceNum)){
                    let source=availableSources[sourceNum];
                    if (source.dedicatedMiner === undefined) {
                        source.dedicatedMiner = 0;
                    }
                    // if (Memory.sources && Memory.sources[source.id]){
                    //     console.log(Memory.sources[source.id]);
                    // }
                }
            }

            //STRUCTURES
            let availableStructures=storedRoom.structures=thisRoom.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType != STRUCTURE_ROAD
            });

            // SPAWN
            storedRoom.spawn=_.filter(availableStructures, function(structure){
                if(structure.structureType == STRUCTURE_SPAWN){
                    return structure;
                }
            });

            // CONTROLLER
            storedRoom.controller=_.filter(availableStructures, function(structure){
                if(structure.structureType == STRUCTURE_CONTROLLER){
                    return structure;
                }
            });

            // CREEPS
            storedRoom.creeps=thisRoom.find(FIND_MY_CREEPS);

            // ROLES
            if(Memory.creepRoles == undefined){
                Memory.creepRoles = {};
            }
            for(let role in RoleManager) {
                if(RoleManager.hasOwnProperty(role)) {
                    Memory.creepRoles[role.role]=role;
                }
            }
            console.log(JSON.stringify(Memory.creepRoles));


            Memory.roomInfo[thisRoom.name]=storedRoom;
        }
    }

    // Calculate role build costs
    if(Memory.roleBuildCosts === undefined){
        Memory.roleBuildCosts={};
        for(let roleName in Memory.creepRoles) {
            if(Memory.creepRoles.hasOwnProperty(roleName)) {
                console.log('Calculate costs for '+roleName);
                let role=RoleManager[roleName];
                let cost=0;
                _.each(role.body, function(part){
                    console.log(part);
                    cost+=Query.creepBodyPartCost()[part];
                });
                Memory.roleBuildCosts[role]=cost;
            }
        }
    }

    // Can we auto build available extensions?
    // let test=Tasks.buildingTypeAvailable(STRUCTURE_EXTENSION, Memory.roomInfo[0]);
    // let test2=Tasks.buildingTypeAvailable(STRUCTURE_TOWER, Memory.roomInfo[0]);
    // console.log('extension available:'+test);
    // console.log('tower available:'+test2);

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
            RoleManager[creep.memory.role].run(creep);
        }
    }

    for(let roleName in Memory.creepRoles) {
        if(Memory.creepRoles.hasOwnProperty(roleName)) {
            if (!Tasks.performCreepleCensusByRole(Memory.creepRoles[roleName])) {
                break;
            }
        }
    }
};