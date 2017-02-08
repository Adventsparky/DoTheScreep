// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

const RoomManager=require('roomManager');
const RoleManager=require('role.manager');
const Tasks=require('tasks');
const Query=require('data');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {

        // console.log('- - - TICK - - -');

        // RIP in pieces
        Tasks.clearMemoryOfDeadCreeples();

        // Calculate role build costs once off
        if (Memory.roleBuildCosts == undefined) {
            Memory.roleBuildCosts = {};
            for (let roleName in Memory.creepRoles) {
                if (Memory.creepRoles.hasOwnProperty(roleName)) {
                    let role = RoleManager[roleName];
                    let cost = 0;
                    _.each(role.parts, function (part) {
                        cost += Query.creepBodyPartCost()[part];
                    });
                    Memory.roleBuildCosts[roleName] = cost;

                    let improvedCost = 0;
                    _.each(role.stage2Parts, function (part) {
                        improvedCost += Query.creepBodyPartCost()[part];
                    });
                    Memory.roleBuildCosts[roleName + 'Stage2Parts'] = improvedCost;
                }
            }
        }

        if (Memory.roomInfo == undefined) {
            Memory.roomInfo = {};
        }

        for (let roomId in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomId)) {
                RoomManager.process(roomId)
            }
        }

        for (let name in Game.creeps) {
            if (Game.creeps.hasOwnProperty(name)) {
                let creep = Game.creeps[name];
                if (creep.memory.role !== undefined) {
                    RoleManager[creep.memory.role].run(creep);
                } else {
                    console.log('wtf no defined role');
                    console.log(creep);
                    console.log(creep.memory.role);
                }
            }
        }

        Tasks.performCreepleCensusByRole();

        Tasks.outputPopulationInfoPerRoom();
    });
};