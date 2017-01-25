const roleHarvester = require('role.harvester');
const roleStaticHarvester = require('role.staticHarvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'harvester',
        targetRoomPopulation: 2,
        minRoomPopulation: 2,
        run: roleHarvester.run
    },
    staticHarvester: {
        parts: [WORK,WORK,WORK,WORK,WORK,MOVE],
        stage2Parts: [WORK,WORK,WORK,WORK,WORK,MOVE],
        role: 'staticHarvester',
        targetRoomPopulation: 0,
        run: roleStaticHarvester.run
    },
    builder: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'builder',
        targetRoomPopulation: 3,
        minRoomPopulation: 1,
        run: roleBuilder.run
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'upgrader',
        targetRoomPopulation: 2,
        minRoomPopulation: 1,
        run: roleUpgrader.run
    }
};