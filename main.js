var MAX_HERVERSTERZ=3;
var MAX_UPGRADERZ=2;
// var MAX_BUILDERZ=2;

var roleHarvester=require('role.harvester');
var roleUpgrader=require('role.upgrader');
var manCave=Game.spawns.Bastion;
var Tasks=require('tasks');

module.exports.loop = function () {

    // RIP in pieces
    Tasks.clearMemoryOfDeadCreeples();

    var herversterzCount=manCave.room.find(FIND_CREEPS, {filter: function(object) {return object.memory.role == 'harvester'}}).length;
    if(herversterzCount<MAX_HERVERSTERZ && manCave.canCreateCreep){
        // MEK SUM HERVERSTERZ
        var newName = manCave.createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
        console.log('I\'ve got a brand new combine harvester ('+newName+') and I\'ll give you the keys!');
    }

    var upgrerderzCount=manCave.room.find(FIND_CREEPS, {filter: function(object) {return object.memory.role == 'upgrader'}}).length;
    if(upgrerderzCount<MAX_UPGRADERZ && manCave.canCreateCreep){
        // MEK SUM UPGRERDERZ
        var newName = manCave.createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
    }
};