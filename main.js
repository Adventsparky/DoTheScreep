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
            for (let roleName in RoleManager) {
                if (RoleManager.hasOwnProperty(roleName)) {
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

        _.each(Game.rooms, function(room) {
            RoomManager.process(room.name);
        });
    });
};