const Tasks=require('tasks');
const Query=require('data');

const roleBasicClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.say('b-c');
        let claimFlag = Game.flags['claim-room'];
        if (claimFlag) {

            if (claimFlag.room == creep.room) {
                let enemyData = Memory.roomInfo[creep.room.name].enemyData;
                if (!enemyData) {
                    // Fuck all to do, might as well retire
                } else {
                    let closestUnclaimedController = _.filter(enemyData.enemyStructures, function (structure) {
                        if (structure.structureType == STRUCTURE_CONTROLLER) {
                            return structure;
                        }
                    });

                    if (closestUnclaimedController[0]) {
                        creep.moveTo(closestUnclaimedController[0]);
                        creep.claimController(closestUnclaimedController[0]);
                    }
                }
            } else {
                creep.moveTo(claimFlag);
            }
        }

    }
};

module.exports = roleBasicClaimer;