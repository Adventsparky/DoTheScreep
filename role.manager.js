const roleHarvester = require('role.harvester');
// const roleStaticHarvester = require('role.staticHarvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        role: 'harvester',
        minRoomPopulation: 7,
        run: roleHarvester.run
    },
    improvedHarvester: {
        parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'harvester',
        minRoomPopulation: 7,
        run: roleHarvester.run
    },
    // staticHarvester: {
    //     parts: [WORK,CARRY,MOVE],
    //     role: 'staticHarvester',
    //     minRoomPopulation: 1,
    //     run: roleStaticHarvester.run
    // },
    builder: {
        parts: [WORK,CARRY,MOVE],
        role: 'builder',
        minRoomPopulation: 4,
        run: roleBuilder.run
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        role: 'upgrader',
        minRoomPopulation: 5,
        run: roleUpgrader.run
    }
};