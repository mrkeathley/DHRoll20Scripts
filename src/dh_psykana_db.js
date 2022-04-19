var DarkHeresyPsykana = [
    // Telekinesis
    {
        name: "Assail",
        class: "damage",
        flavor: "throws a nearby object at",
        focusPower: 10,
        weapon: function(DarkHeresy){return {
            "type": "bolt",
            "range": 20 * DarkHeresy.effective_rating,
            "rateOfFire": {"single": 1, "burst": 0, "full": 0},
            "damage": "1d10+" + (1 * DarkHeresy.effective_rating),
            "damageType": "impact",
            "penetration": 2,
            "special": {}
        }},
        effect: function (DarkHeresy) {
            if(DarkHeresy.degrees_of_success > 2) {
                return '--Assail Push| ' + DarkHeresy.target_name + ' is also thrown **' + randomInteger(5) + 'm** and knocked prone.';

            }
        }
    },
    {
        name: "Crush",
        class: "damage",
        flavor: "crushes",
        focusPower: 0,
        weapon: function(DarkHeresy){return {
            "type": "bolt",
            "range": 10 * DarkHeresy.effective_rating,
            "rateOfFire": {"single": 1, "burst": 0, "full": 0},
            "damage": "1d10+" + (1 * DarkHeresy.effective_rating),
            "damageType": "impact",
            "penetration": 2,
            "special": {"snare": Math.ceil((DarkHeresy.effective_rating/2))}
        }},
        effect: function (DarkHeresy) {
            return '--Crush| ' + DarkHeresy.target_name + ' opposes this attack with a Toughness test.';
        }
    },
    {
        name: "Shockwave",
        class: "damage",
        flavor: "emits a powerful shockwave",
        focusPower: 0,
        weapon: function(DarkHeresy){return {
            "type": "blast",
            "range": 0,
            "rateOfFire": {"single": 1, "burst": 0, "full": 0},
            "damage": "1d10+" + (1 * DarkHeresy.effective_rating),
            "damageType": "explosive",
            "penetration": 0,
            "special": {"blast": (1 * DarkHeresy.effective_rating)}
        }},
        effect: function (DarkHeresy) {
            return '--Shockwave| Everyone in the area of effect is pushed ' + DarkHeresy.psyker_rating + 'm directly away.';
        }
    },
    {
        name: "Telekine Dome",
        class: "concentration",
        flavor: "shields himself and nearby allies with a dome of mental force",
        focusPower: 0,
        range: function (DarkHeresy) {
            return 5 * DarkHeresy.effective_rating;
        },
        effect: function (DarkHeresy) {
            return "--Telekine Dome| A dome of invisible energy is emitted with a radius of " + DarkHeresy.effective_rating / 2 +
                " meters. All allies in the dome gain " + DarkHeresy.effective_rating +
                " armor for attacks that originated outside the dome's radius.";
        }
    },

    // Pyromancy
    {
        name: "Molten Beam",
        class: "damage",
        flavor: "sends a blindingly bright beam of sun-hot energy at",
        weapon: function(DarkHeresy){return {
            "type": "bolt",
            "range": 5 * DarkHeresy.effective_rating,
            "rateOfFire": {"single": 1, "burst": 0, "full": 0},
            "damage": "1d10+" + 5 + (3 * DarkHeresy.effective_rating),
            "damageType": "energy",
            "penetration": 2 * DarkHeresy.effective_rating,
            "special": {"melta": true}
        }}
    },
    {
        name: "Spontaneous Combustion",
        class: "damage",
        flavor: "begins to boil the blood and flesh of",
        weapon: function(DarkHeresy){return {
            "type": "bolt",
            "range": 20 * DarkHeresy.effective_rating,
            "rateOfFire": {"single": 1, "burst": 0, "full": 0},
            "damage": "1d10+" + 2 + (2 * DarkHeresy.effective_rating),
            "damageType": "energy",
            "penetration": 0,
            "special": {"fire": true}
        }}
    },

]