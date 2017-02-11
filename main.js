// Any modules that you use that modify the game's prototypes should be require'd
// before you require the profiler.
const profiler = require('screeps-profiler');

const RoomManager=require('roomManager');
const Tasks=require('tasks');

// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {

        // RIP in pieces
        Tasks.clearMemoryOfDeadCreeples();

        _.each(Game.rooms, function(room) {
            RoomManager.process(room.name);
        });
    });
};