const roleHarvester = require('role.harvester');
const roleStaticHarvester = require('role.staticHarvester');
const roleHauler = require('role.hauler');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleBasicSoldier = require('role.basicSoldier');
const roleBasicClaimer = require('role.basicClaimer');

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'harvester',
        targetRoomPopulation: 4,
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
    hauler: {
        parts: [CARRY,CARRY,MOVE,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'hauler',
        targetRoomPopulation: 0,
        run: roleHauler.run
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
        targetRoomPopulation: 4,
        minRoomPopulation: 1,
        run: roleUpgrader.run
    },
    basicSoldier: {
        parts: [ATTACK,ATTACK,MOVE,MOVE],
        stage2Parts: [ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE],
        role: 'basicSoldier',
        targetRoomPopulation: 0,
        run: roleBasicSoldier.run
    },
    basicClaimer: {
        parts: [CLAIM,CLAIM,MOVE,MOVE],
        role: 'basicClaimer',
        targetRoomPopulation: 0,
        run: roleBasicClaimer.run
    }
};