const roleBasicSoldier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.say('b-s');
        let attackFlag = Game.flags['attack-room'];
        if (attackFlag) {

            if(attackFlag.room == creep.room) {
                let enemyData = Memory.roomInfo[creep.room.name].enemyData;
                if (!enemyData) {
                    // Fuck all to do, might as well retire
                } else {
                    let simpleClosestTarget = null;
                    // Time to kick some ass and chew bubble gum
                    if (enemyData.enemyCreeps[0]) {
                        // Might need to handle towers
                        simpleClosestTarget = creep.pos.findClosestByPath((FIND_HOSTILE_CREEPS));
                    } else if (enemyData.enemyStructures[0]) {
                        simpleClosestTarget = creep.pos.findClosestByPath((FIND_HOSTILE_SPAWNS));
                    }

                    if (simpleClosestTarget) {
                        creep.moveTo(simpleClosestTarget);
                        creep.attack(simpleClosestTarget);
                    }
                }
            } else {
                creep.moveTo(attackFlag);
            }
        }


    }
};

module.exports = roleBasicSoldier;