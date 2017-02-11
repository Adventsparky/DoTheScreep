// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');
const RoomManager=require('roomManager');
const Utils=require('tasks');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {

        console.log(Game);
        // RIP in pieces
        Utils.clearMemoryOfDeadCreeps();

        _.each(Game.rooms, function(room) {
            RoomManager.process(room.name);
        });
    });
};