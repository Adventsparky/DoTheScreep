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
        run: roleHarvester.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    staticHarvester: {
        parts: [WORK,WORK,WORK,WORK,WORK,MOVE],
        stage2Parts: [WORK,WORK,WORK,WORK,WORK,MOVE],
        role: 'staticHarvester',
        targetRoomPopulation: 0,
        run: roleStaticHarvester.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    hauler: {
        parts: [CARRY,CARRY,MOVE,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'hauler',
        targetRoomPopulation: 0,
        run: roleHauler.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    builder: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'builder',
        targetRoomPopulation: 1,
        minRoomPopulation: 1,
        run: roleBuilder.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'upgrader',
        targetRoomPopulation: 4,
        minRoomPopulation: 1,
        run: roleUpgrader.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    basicSoldier: {
        parts: [ATTACK,ATTACK,MOVE,MOVE],
        stage2Parts: [ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE],
        role: 'basicSoldier',
        targetRoomPopulation: 0,
        run: roleBasicSoldier.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    basicClaimer: {
        parts: [CLAIM,MOVE],
        role: 'basicClaimer',
        targetRoomPopulation: 0,
        run: roleBasicClaimer.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    },
    bigClaimer: {
        parts: [CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,MOVE,MOVE],
        role: 'bigClaimer',
        targetRoomPopulation: 0,
        run: roleBasicClaimer.run,
        name: function() { return this.role+'-'+Game.time.toString(); }
    }
};