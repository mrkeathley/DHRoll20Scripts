const DarkHeresyAmmo = [
    {
        "name": "Amputator Shells",
        "availability": "Extremely Rare",
        "damage": 2,
        "weapon_type": "Stub revolvers, stub automatics, shotguns (all types), sniper rifles, hand cannons, autopistols, and autoguns."
    },
    {
        "name": "Ataractic Quill",
        "availability": "Very Rare",
        "weapon": {
            "special": {
                "concussive": 5,
                "reliable": true
            }
        },
        "weapon_type": "Quillgun"
    },
    {
        "name": "Bleeder Rounds",
        "availability": "Rare",
        "special": "If target suffers damage, they also suffer Blood Loss for [[1d5]] rounds or until treated.",
        "weapon_type": "Stub revolvers, stub automatics, hand cannons, autopistols, and autoguns."
    },
    {
        "name": "Dumdum Bullets",
        "availability": "Scarce",
        "damage": 2,
        "special": "Target gets double armour points against this ammo.",
        "weapon_type": "Stub revolvers, stub automatics, sniper rifles, and hand cannons."
    },
    {
        "name": "Emperors Light Thermal Bolts",
        "availability": "Rare",
        "damage": "1d10",
        "penetration": 6,
        "weapon": {
            "special": {
                "primitive": false,
                "accurate": false,
                "melta": true,
                "inaccurate": true
            }
        },
        "weapon_type": "Crossbows"
    },
    {
        "name": "Emperors Wrath Shard Bolts",
        "availability": "Scarce",
        "weapon": {
            "special": {
                "crippling": 2
            }
        },
        "weapon_type": "Crossbows"
    },
    {
        "name": "Expander Rounds",
        "availability": "Scarce",
        "damage": 1,
        "penetration": 1,
        "weapon_type": "Stub revolvers, stub automatics, sniper rifles, autopistols, and autoguns."
    },
    {
        "name": "Explosive Arrows/Quarrels",
        "availability": "Scarce",
        "attack": -10,
        "weapon": {
            "damageType": "explosive",
            "special": {
                "primitive": false,
                "blast": 1
            }
        },
        "weapon_type": "Bows and crossbows."
    },
    {
        "name": "Heretics Match Incendiary Rounds",
        "availability": "Scarce",
        "weapon": {
            "special": {
                "flame": true,
                "unreliable": true,
                "blast": false
            }
        },
        "weapon_type": "Bows, Crossbows, Shotguns."
    },
    {
        "name": "Hot-Shot Charge Packs",
        "availability": "Scarce",
        "damage": 1,
        "penetration": 4,
        "weapon": {
            "special": {
                "tearing": true,
                "reliable": false
            },
            "clip": {"max": 1, "value": 1}
        },
        "weapon_type": "Laspistols, lascarbines, lasguns, and long las weapons."
    },
    {
        "name": "Inferno Shells",
        "availability": "Rare",
        "weapon": {
            "special": {
                "flame": true
            }
        },
        "weapon_type": "Shotgun and all Bolt weapons."
    },
    {
        "name": "Man-Stopper Bullets",
        "availability": "Scarce",
        "penetration": 3,
        "weapon_type": "Stub revolvers, stub automatics, hand cannons, sniper rifles, autopistols, and autoguns."
    },
    {
        "name": "Purgatus Stakes",
        "availability": "Extremely Rare",
        "special": "Whenever a target with either the Psyker or Daemon trait is struck by a Purgatus stake-bolt, it must make a Challenging (+0) Willpower test. If it fails, it must immediately roll on Table 62: Psychic Phenomena.",
        "weapon": {
            "special": {
                "sanctified": true
            }
        },
        "weapon_type": "Purgatus Crossbow only."
    },
    {
        "name": "Purity Bolts",
        "availability": "Very Rare",
        "weapon": {
            "special": {
                "haywire": 2
            }
        },
        "weapon_type": "Crossbows."
    },
    {
        "name": "Sanctified Ammunition",
        "availability": "Rare",
        "weapon": {
            "special": {
                "sanctified": true
            }
        },
        "weapon_type": "Bows, Crossbows, Flame, Solid Projectile weapons."
    },
    {
        "name": "Scrambler Rounds",
        "availability": "Rare",
        "weapon": {
            "special": {
                "hallucinogenic": 2,
                "recharge": true
            }
        },
        "weapon_type": "Bolt and Solid Projectile weapons"
    },
    {
        "name": "Silver Stakes",
        "availability": "Very Rare",
        "special": "Daemonic or Psyker entities take an additional [[1d10]] damage.",
        "weapon": {
            "special": {
                "sanctified": true
            }
        },
        "weapon_type": "Crossbows"
    },
    {
        "name": "Tempest Bolt Shells",
        "availability": "Near Unique",
        "special": "If the target has the machine trait, take an additional 3 damage.",
        "weapon": {
            "damageType": "energy",
            "special": {
                "shocking": true
            }
        },
        "weapon_type": "Bolt pistols, boltguns, and heavy bolters."
    },
    {
        "name": "Theta-Pattern Concussion Bolts",
        "availability": "Very Rare",
        "special": "Anyone within the blast radius must pass a Hard (20) Strength test or be thrown 1d5 metres away from the centre of the blast and knocked Prone.",
        "weapon": {
            "special": {
                "blast": 5,
                "concussive": 5
            }
        },
        "weapon_type": "Crossbows"
    },
    {
        "name": "Theta-Pattern Shock Bolts",
        "availability": "Very Rare",
        "special": "If the target fails its Toughness test from the Shocking effect by three or more degrees, it becomes Unconscious instead of Stunned for a number of rounds equal to his degrees of failure.",
        "weapon": {
            "special": {
                "shocking": true
            }
        },
        "weapon_type": "Crossbows"
    },
    {
        "name": "Tox Rounds",
        "availability": "Scarce",
        "damage": -2,
        "weapon": {
            "special": {
                "toxic": 1
            }
        },
        "weapon_type": "Bolt and Solid Projectile weapons"
    },
    {
        "name": "Veneum Quill",
        "availability": "Scarce",
        "weapon": {
            "special": {
                "toxic": 4,
                "reliable": true
            }
        },
        "weapon_type": "Quillgun"
    },
    {
        "name": "Abyssal Bolt",
        "availability": "Very Rare",
        "weapon": {
            "special": {
                "crippling": 2,
                "tainted": true,
                "reliable": false,
                "sanctified": false
            }
        },
        "weapon_type": "Bolt weapons and crossbows"
    },
    {
        "name": "Nitidus Rounds",
        "availability": "Very Rare",
        "special": "When a psyker suffers damage from this weapon, he must make a Difficult (10) Willpower test or be Stunned for a number of rounds equal to his degrees of failure. When a target with the Warp Instability trait suffers damage from this weapon, it must immediately test for Instability with a 10 penalty.",
        "weapon_type": "Combat shotguns, shotguns"
    },
    {
        "name": "Psybolts",
        "availability": "Extremely Rare",
        "special": "Add +1 damage for every point of the users psy rating. Ignores all protective benefits granded by psychic powers.",
        "weapon": {
            "special": {
                "daemonbane": true,
                "sanctified": true
            }
        },
        "weapon_type": "Bolt Weapons"
    },
    {
        "name": "Psyflame",
        "availability": "Very Rare",
        "special": "Ignores any protective benefits granted by psychic powers. Targets in its area of effect suffer a penalty to the Agility test to avoid being hit equal to 5 times the psykers psy rating.",
        "weapon": {
            "special": {
                "sanctified": true
            }
        },
        "weapon_type": "Flame Weapons"
    }
]
