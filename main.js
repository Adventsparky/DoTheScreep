// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');
const RoomManager=require('manager.room');
const Utils=require('tasks');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {

        if (Memory.highPrioritySpawns == undefined) {
            Memory.highPrioritySpawns=[];
        }

        if (Memory.creepCounter == undefined || Memory.creepCounter > 1000) {
            Memory.creepCounter = 1;
        }

        _.each(Game.rooms, function(room) {
            RoomManager.process(room.name);
        });

        // RIP in pieces
        Utils.clearMemoryOfDeadCreeps();
    });
};