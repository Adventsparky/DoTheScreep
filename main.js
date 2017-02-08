// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

const RoomManager=require('roomManager');
const Tasks=require('tasks');
const Query=require('data');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {

        // console.log('- - - TICK - - -');

        // RIP in pieces
        Tasks.clearMemoryOfDeadCreeples();

        // Once off
        Tasks.roleBuildCosts();

        if (Memory.roomInfo == undefined) {
            Memory.roomInfo = {};
        }

        // Main room loop
        for (let roomId in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomId)) {
                RoomManager.process(roomId)
            }
        }

        Tasks.performCreepleCensusByRole();
        Tasks.outputPopulationInfoPerRoom();
    });
};