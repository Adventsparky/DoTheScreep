var manCave=Game.spawns.Bastion;

module.exports = {

    collectNearestEnergy: function(creep) {
        var closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    buildNearestBuilding: function(creep) {
        var closestSource=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
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
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    },
    performCreepleCensusByRole: function(role) {
        var creepleCountForRole = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
        if(creepleCountForRole.length < role.min) {
            manCave.createCreep(role.parts,undefined, {role: role.role});
            return false;
        }
        return true;
    }
};