const roleHarvester = require('role.harvester');
const roleStaticHarvester = require('role.staticHarvester');
const roleHauler = require('role.hauler');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleBasicSoldier = require('role.basicSoldier');
const roleBasicClaimer = require('role.basicClaimer');

const creepBodyPartCost = function() {
    return {
        "move": 50,
        "carry": 50,
        "work": 100,
        "heal": 250,
        "claim": 600,
        "tough": 10,
        "attack": 80,
        "ranged_attack": 150
    };
};

function pricePerPartsBlock(role) {
    let cost = 0;
    _.each(role.parts, function (part) {
        cost += creepBodyPartCost()[part];
    });
    return cost;
}

module.exports = {
    harvester: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'harvester',
        targetRoomPopulation: 4,
        minRoomPopulation: 2,
        run: roleHarvester.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    },
    staticHarvester: {
        parts: [WORK,WORK,WORK,WORK,WORK,MOVE],
        stage2Parts: [WORK,WORK,WORK,WORK,WORK,MOVE],
        role: 'staticHarvester',
        targetRoomPopulation: 0,
        run: roleStaticHarvester.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    },
    hauler: {
        parts: [CARRY,CARRY,MOVE,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'hauler',
        targetRoomPopulation: 0,
        run: roleHauler.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    },
    builder: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'builder',
        targetRoomPopulation: 2,
        minRoomPopulation: 1,
        run: roleBuilder.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    },
    upgrader: {
        parts: [WORK,CARRY,MOVE],
        stage2Parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        role: 'upgrader',
        targetRoomPopulation: 4,
        minRoomPopulation: 1,
        run: roleUpgrader.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    },
    basicSoldier: {
        parts: [ATTACK,ATTACK,MOVE,MOVE],
        stage2Parts: [ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE],
        role: 'basicSoldier',
        targetRoomPopulation: 0,
        run: roleBasicSoldier.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    },
    basicClaimer: {
        parts: [CLAIM,MOVE],
        role: 'basicClaimer',
        targetRoomPopulation: 0,
        run: roleBasicClaimer.run,
        name: function() { return this.role+'-'+Game.time.toString(); },
        pricePerBlock: pricePerPartsBlock(this)
    }
};