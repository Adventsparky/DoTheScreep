const roleHarvester = require('role.harvester');
// const roleStaticHarvester = require('role.staticHarvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'harvester',
        minRoomPopulation: 4,
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
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'builder',
        minRoomPopulation: 3,
        run: roleBuilder.run
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'upgrader',
        minRoomPopulation: 4,
        run: roleUpgrader.run
    }
};