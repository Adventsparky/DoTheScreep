const manCave=Game.spawns.Bastion;

module.exports = {

    collectNearestEnergy: function(creep) {
        let closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    collectNearestEnergyToBase: function(creep) {
        let closestSource=manCave.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    buildNearestBuilding: function(creep) {
        let closestSource=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(creep.build(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    upgradeController: function(creep) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    },
    dumpEnergyAtBase: function(creep) {
        if(creep.transfer(manCave, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(manCave);
        }
    },
    pickBestEnergyDump: function(creep) {
        if(manCave.energy >= (manCave.energyCapacity-(manCave.energyCapacity*.05))){
            this.upgradeController(creep);
        } else{
            this.dumpEnergyAtBase(creep);
        }
    },
    clearMemoryOfDeadCreeples: function() {
        for (let name in Memory.creeps) {
            if(Memory.creeps.hasOwnProperty(name)) {
                if (!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log('Clearing non-existing creep memory:', name);
                }
            }
        }
    },
    performCreepleCensusByRole: function(role) {
        let creepleCountForRole = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
        if(creepleCountForRole.length < role.min) {
            manCave.createCreep(role.parts,undefined, {role: role.role});
            return false;
        }
        return true;
    }
};