const manCave=Game.spawns.Bastion;
const MIN_HITS=5000;

module.exports = {

    /*
     * ENERGY COLLECTION
     */
    collectNearestEnergy: function(creep) {
        let closestSource=creep.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },
    collectNearestEnergyToHomeBase: function(creep) {
        let closestSource=manCave.pos.findClosestByRange(FIND_SOURCES);
        if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource);
        }
    },

    /*
     * ENERGY DUMPING
     */
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

    /*
     * CONSTRUCTION
     */
    buildNearestStructure: function(creep) {
        let closestBuildingSite=creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);
        if(closestBuildingSite) {
            if (creep.build(closestBuildingSite) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestBuildingSite);
            }
        } else{
            this.repairNearestStructure(creep);
        }
    },
    repairNearestStructure: function(creep) {
        let closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.hits < MIN_HITS && structure.hits < structure.hitsMax);
            }
        });
        if(closestDamagedStructure) {
            console.log('Repair closest ' + closestDamagedStructure)
            let status = creep.repair(closestDamagedStructure)
            if(status == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestDamagedStructure);
            } else {
                creep.say('Repair ' + status)
            }
        } else {
            creep.say('Nothing to repair')
        }
    },

    /*
     * UTILS
     */
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

    /*
     * CREEPLE MANAGEMENT
     */
    performCreepleCensusByRole: function(role) {
        let creepleCountForRole = _.filter(Game.creeps, (creep) => creep.memory.role == role.role);
        if(creepleCountForRole.length < role.min) {
            manCave.createCreep(role.parts,undefined, {role: role.role});
            return false;
        }
        return true;
    }
};