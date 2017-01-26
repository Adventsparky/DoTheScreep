const Tasks=require('tasks');

const roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        // Get to spawn, find a source without a flag for static harvest
        if (!creep.memory.targetSource) {
            let closestSourceWithoutStaticHarvester = _.find(room.availableSources, function (source) {
                return !source.staticHarvester;
            });
            if (closestSourceWithoutStaticHarvester) {
                creep.memory.targetSource = closestSourceWithoutStaticHarvester.id;
            }
        }

        if (creep.harvest(creep.harvest(creep.memory.targetSource)) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.harvest(creep.memory.targetSource));
            return;
        }

        // We got this far check for adjacent container
        if (!creep.memory.staticMinerContainer) {
            let closestContainer = creep.pos.findClosestByRange(STRUCTURE_CONTAINER)
            if(closestContainer.pos != creep.pos) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
            }else {
                creep.memory.staticMinerContainer=closestContainer;
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