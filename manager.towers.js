module.exports = {
    process : function (roomInfo) {

        if (roomInfo.towers) {
            _.each(roomInfo.towers, function (tower) {
                let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestHostile) {
                    let suppressTowerAttackFlag = Game.flags['suppress-ta'];
                    if (!suppressTowerAttackFlag) {
                        tower.attack(closestHostile);
                    }
                } else{
                    let suppressTowerRepairFlag = Game.flags['suppress-tr'];
                    let energyFlowIsOk = tower.energy > tower.energyCapacity*.4 && roomInfo.energyAvailable > roomInfo.energyCapacity*.3;
                    if (!suppressTowerRepairFlag && energyFlowIsOk) {
                        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 150000 // todo remove hardcoded hits check for tower repair
                        });
                        if (roomInfo.energyAvailable > roomInfo.energyCapacity*.3) {
                            if (!closestDamagedStructure) {
                                closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                                    filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 200000 // todo remove hardcoded hits check for tower repair
                                });
                            }
                            if (roomInfo.energyAvailable > roomInfo.energyCapacity*.5) {
                                if (!closestDamagedStructure) {
                                    closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                                        filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 300000 // todo remove hardcoded hits check for tower repair
                                    });
                                }
                                if (roomInfo.energyAvailable > roomInfo.energyCapacity*.6) {
                                    if (!closestDamagedStructure) {
                                        closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                                            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 500000 // todo remove hardcoded hits check for tower repair
                                        });
                                    }
                                    if (!closestDamagedStructure) {
                                        closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                                            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 700000 // todo remove hardcoded hits check for tower repair
                                        });
                                    }
                                    if (!closestDamagedStructure) {
                                        closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                                            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 1000000 // todo remove hardcoded hits check for tower repair
                                        });
                                    }
                                    if (closestDamagedStructure) {
                                        tower.repair(closestDamagedStructure);
                                    }
                                }
                            }
                        }
                    }
                }


            });
        }

    }
};
