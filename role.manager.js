const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        role: 'harvester',
        min: 4,
        run: roleHarvester.run
    },
    builder: {
        parts: [WORK,CARRY,MOVE],
        role: 'builder',
        min: 5,
        run: roleBuilder.run
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        role: 'upgrader',
        min: 5,
        run: roleUpgrader.run
    }
};