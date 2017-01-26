const Tasks=require('tasks');

const roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let room=Memory.roomInfo[creep.room.name];

        // Get to spawn, find a source without a flag for static harvest
        if (!creep.memory.targetSource) {
            let closestSourceWithoutStaticHarvester = _.find(room.availableSources, function (source) {
                return !source.staticHarvester;
            });
            if (closestSourceWithoutStaticHarvester) {
                creep.memory.targetSource = closestSourceWithoutStaticHarvester.id;
            }
        }

        let source = _.find(room.availableSources, function (source) {
            return source.id == creep.memory.targetSource;
        });

        let canHarvest=creep.harvest(creep.memory.targetSource);
        if (canHarvest == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.memory.targetSource);
            return;
        } else{
            source.dedicatedMiner=creep.id;
        }

        // We got this far check for adjacent container
        if (!creep.memory.staticMinerContainer && canHarvest == OK) {
            console.log('Ok we are harvesting away not a bother');
            let closestContainer = creep.pos.findClosestByRange(STRUCTURE_CONTAINER);
            if (!closestContainer || closestContainer.pos != creep.pos) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
            } else {
                source.container=closestContainer;
            }
        }

        Tasks.collectEnergy(creep);

        // Wait for Container or dump
        if (creep.carry > 0) {
            creep.drop(RESOURCE_ENERGY, creep.carry);
        }
    }
};

module.exports = roleStaticHarvester;