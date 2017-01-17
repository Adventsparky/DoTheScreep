var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        role: 'harvester',
        min: 2,
        run: roleHarvester.run
    },
    builder: {
        parts: [WORK,CARRY,MOVE],
        role: 'builder',
        min: 3,
        run: roleBuilder.run
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        role: 'upgrader',
        min: 2,
        run: roleUpgrader.run
    }
};