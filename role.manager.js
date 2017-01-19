const roleHarvester = require('role.mobileHarvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');

module.exports = {
    mobileHarvester: {
        parts: [WORK,CARRY,MOVE],
        role: 'mobileHarvester',
        minRoomPopulation: 4,
        run: roleHarvester.run
    },
    staticHarvester: {
        parts: [WORK,CARRY,MOVE],
        role: 'staticHarvester',
        minRoomPopulation: 4,
        run: roleHarvester.run
    },
    builder: {
        parts: [WORK,CARRY,MOVE],
        role: 'builder',
        minRoomPopulation: 5,
        run: roleBuilder.run
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        role: 'upgrader',
        minRoomPopulation: 5,
        run: roleUpgrader.run
    }
};