const roleBasicClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.say('b-c');
        let claimFlag = Game.flags['claim-room'];
        if (claimFlag) {

            if (claimFlag.room == creep.room) {

                let controller = creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER});
                console.log(controller);
                if (controller && controller[0] && controller[0].level == 0) {
                    creep.moveTo(controller[0]);
                    creep.claimController(controller[0]);
                }

            } else {
                creep.moveTo(claimFlag);
            }
        }

    }
};

module.exports = roleBasicClaimer;