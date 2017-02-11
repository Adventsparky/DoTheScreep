'use strict';

Game.prototype.clearMemoryOfDeadCreeps = function() {
    _.each(Memory.creeps, function(creep) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    });
}