//@ts-check
var DarkHeresy2nd = DarkHeresy2nd || (function () {
    // 'use strict';

    // VERSION INFO
    const DarkHeresy_Author = 'Matt Keathley';
    const DarkHeresy_Version = '2.0.0';
    const DarkHeresy_LastUpdated = '2022-02-01';

    // POWER CARDS
    var powerCardFunction = function () {};

    // AMMO 
    var ammoFunction = function () {};

    // FUNCTION DECLARATIONS
    var DarkHeresy = DarkHeresy || {};

    // Ready and Check for PowerCards
    on("ready", function () {
        log('-=> DarkHeresy2ndEdition v' + DarkHeresy_Version + ' <=-  [' + DarkHeresy_LastUpdated + ']');

        // Check PowerCards
        if ("undefined" !== typeof PowerCard && _.isFunction(PowerCard.Process)) {
            powerCardFunction = PowerCard.Process;
        } else if ("undefined" !== typeof PowerCardScript && _.isFunction(PowerCardScript.Process)) {
            powerCardFunction = PowerCardScript.Process;
        } else if ("undefined" !== typeof PowerCards && _.isFunction(PowerCards.Process)) {
            powerCardFunction = PowerCards.Process;
        } else {
            log('No Powercards Script Found. Dark Heresy will not work.');
        }

        // Check Ammo
        if ("undefined" !== typeof Ammo && _.isFunction(Ammo.HandleInput)) {
            ammoFunction = Ammo.HandleInput;
        } else {
            log('No Ammo Script Found. Dark Heresy Weapons will not update ammo counts.');
        }

        // Check TokenMod
        if ("undefined" === typeof TokenMod) {
            log('No TokenMod Script Found. Dark Heresy will not update token charms.');
        }

        // Check Databases
        if ("undefined" === typeof DarkHeresyWeapons) {
            log('No Weapon Database found -- Dark Heresy will not be able to make attack rolls.');
        }
        if ("undefined" === typeof DarkHeresyPsykana) {
            log('No Psykana Database found -- Dark Heresy will not be able to make psykana rolls.');
        }
        if ("undefined" === typeof DarkHeresyAmmo) {
            log('No Ammo Database found -- Dark Heresy will not be able to make ammo modifications.');
        }
        if ("undefined" === typeof DarkHeresyGear) {
            log('No Gear Database found -- Dark Heresy will not be able to make gear rolls.');
        }
    });

    // Command Handler
    on('chat:message', function (msg) {
        if (msg.type !== "api") {
            return;
        }

        switch (msg.content.split(" ", 1)[0].toLowerCase()) {
            case "!dh_2nd":
            case "!dh":
                const player_obj = getObj("player", msg.playerid);
                msg.who = msg.who.replace(" (GM)", "");
                msg.content = msg.content.replace(/<br\/>\n/g, ' ').replace(/({{)(.*)((\}\}))/, " $2 ").replace(/\[#\[/g, "[[").replace(/\]#\]/g, "]]");
                DarkHeresy.process(msg, player_obj);
                break;
            case "!dh_version":
                sendChat("", "/w " + msg.who + " You are using version " + DarkHeresy_Version +
                    " of DarkHeresy Weapons, authored by " + DarkHeresy_Author + ", which was last updated on: " + DarkHeresy_LastUpdated + ".");
                break;
        }
    });

    DarkHeresy.process = async function (msg, player_obj) {

        // Create Dark Heresy Object
        let DarkHeresy = {
            msg: _.clone(msg),
            mod_target: [],
            roll: randomInteger(100),
            range: 0,
            target_name: '',
            use_ammo: false
        };

        // Parse Arguments
        let argument_array = (player_obj) ? msg.content.replace("%%who%%", player_obj.get("displayname")).split(/\s+--/) : msg.content.split(/\s+--/);
        argument_array.shift();

        // Handle each tag
        _.each(argument_array, function (a) {
            let tag = a.substring(0, a.indexOf("|")).trim();
            let content = a.substring(a.indexOf("|") + 1).trim();

            // Source
            if (tag === 'source' && (getToken(content) !== undefined)) {
                DarkHeresy['token'] = getToken(content);
                DarkHeresy['character'] = getObj("character", DarkHeresy.token.get("represents"));
                DarkHeresy['character_id'] = DarkHeresy.character.id;
            }

            // Character Id
            if (tag === 'character_id') {
                DarkHeresy['character'] = getObj("character", content);
            }

            // Target
            if (tag === 'target' && (getToken(content) !== undefined)) {
                DarkHeresy['target_token'] = getToken(content);
                DarkHeresy['target_character'] = getObj("character", DarkHeresy.target_token.get("represents"));
                DarkHeresy['target_character_id'] = DarkHeresy.target_character.id;
            }

            // Weapons
            if (tag === 'weapon') {
                let weapon = _.findWhere(DarkHeresyWeapons, {name: content});
                if (weapon !== undefined) {
                    DarkHeresy['weapon_name'] = content;
                    content = _.clone(weapon);
                    DarkHeresy['action'] = 'weapon';
                }
            }
            if (tag === 'weaponreplace' && DarkHeresy.weapon !== undefined) {
                const replacements = content.split(";")
                for (let replacement of replacements) {
                    if(replacement.includes('|')) {
                        const key = replacement.split("|")[0].trim();
                        const value = replacement.split("|")[1].trim();
                        DarkHeresy.weapon[key] = value;
                    }
                }
            }
            if (tag === 'specialreplace' && DarkHeresy.weapon !== undefined) {
                if(!DarkHeresy.weapon.special) DarkHeresy.weapon.special = {};
                const replacements = content.split(";")
                for (let replacement of replacements) {
                    if(replacement.includes('|')) {
                        const key = replacement.split("|")[0].trim();
                        let value = replacement.split("|")[1].trim();
                        if(value === 'true' || value === 'false') {
                            value = Boolean(value);
                        } else {
                            value = Number(value);
                        }
                        DarkHeresy.weapon.special[key] = value;
                    }
                }
            }
            
            if (tag === 'use_ammo') {
                content = Boolean(content)
            }

            // Ammo
            if (tag === 'ammo') {
                let ammo = _.findWhere(DarkHeresyAmmo, {name: content})
                DarkHeresy['ammo_name'] = content;
                content = _.clone(ammo)
            }

            // Psykana
            if (tag === 'psykana') {
                let psykana = _.findWhere(DarkHeresyPsykana, {name: content});
                if(psykana !== undefined) {
                    log('found psykana')
                    DarkHeresy['psykana_name'] = content.name;
                    content = _.clone(psykana);
                    DarkHeresy['action'] = 'psykana';
                }
            }

            // Gear
            if (tag === 'gear') {
                let gear = _.findWhere(DarkHeresyGear, {name: content});
                if(gear !== undefined) {
                    DarkHeresy['gear_name'] = content.name;
                    content = _.clone(gear);
                    DarkHeresy['action'] = 'gear';
                    DarkHeresy['gear_action'] = 'activate';
                }
            }
            if (tag === 'gearreplace' && DarkHeresy.gear !== undefined) {
                const replacements = content.split(";")
                for (let replacement of replacements) {
                    if(replacement.includes('|')) {
                        const key = replacement.split("|")[0].trim();
                        const value = replacement.split("|")[1].trim();
                        DarkHeresy.gear[key] = value;
                    }
                }
            }

            DarkHeresy[tag] = content;
        });

        // Target and Range
        if (DarkHeresy.token && DarkHeresy.target_token) {
            // Range
            let distance = tokenDistance(DarkHeresy.token, DarkHeresy.target_token);
            DarkHeresy['range'] = distance.measurement;

            // Target Name
            if (!DarkHeresy.target_token.get('name')) {
                DarkHeresy['target_name'] = 'The target';
            } else {
                DarkHeresy['target_name'] = DarkHeresy.target_token.get('name');
            }
        }

        switch (DarkHeresy.action) {
            case "weapon":
                console.log('A')
                if(!validateAndUpdateWeaponAction(DarkHeresy)) {
                    return;
                }
                console.log('B')
                calculateWeaponTarget(DarkHeresy);
                console.log('C')
                await handleWeaponAttack(DarkHeresy);
                console.log('D')
                createWeaponResults(DarkHeresy);
                console.log('E')
                if(!DarkHeresy.melee && DarkHeresy.use_ammo) {
                    handleAmmo(DarkHeresy);
                }
                console.log('F')
                sendResults(DarkHeresy);
                break;
            case "psykana":
                if(!validateAndUpdatePsykanaAction(DarkHeresy)) {
                    return;
                }
                calculatePsykanaTarget(DarkHeresy);
                if(DarkHeresy.psykana.class === 'damage') {
                    await handleWeaponAttack(DarkHeresy);
                } else {
                    await handleBasicPsykanaActivation(DarkHeresy);
                }
                createPsykanaResults(DarkHeresy);
                sendResults(DarkHeresy);
                break;
            case "gear":
                calculateGearTarget(DarkHeresy);
                createGearResults(DarkHeresy);
                sendResults(DarkHeresy);
                break;
            default:
                sendChat("", "/w " + msg.who + " Must provide an action: weapon, psykana, gear. ");
        }
    }

    function sendResults(DarkHeresy) {
        let power = '!power {{ ' +
            '--titlefontshadow|none\n' +
            '--titlefont|Georgia\n' +
            '--titlefontsize| 20px\n' +
            '--corners|10\n';

        for (const line of DarkHeresy.power_card) {
            power += line + '\n';
        }

        let msg = DarkHeresy.msg;
        msg.content = power;
        msg.who = msg.who.replace(" (GM)", "");
        const player_obj = getObj("player", msg.playerid);
        powerCardFunction(msg, player_obj);
    }

    function calculateGearTarget(DarkHeresy) {
        let gear_target = [];
        let gear = DarkHeresy.gear;

        // Extra Modifier
        if (DarkHeresy.modifier !== undefined) {
            addToModifierArray(gear_target, 'modifier', DarkHeresy.modifier);
        }

        // Force Field
        if(gear.forceField) {
            addToModifierArray(gear_target, 'force field', gear.forceField);
            let overload = 1;
            if(gear.quality === 'good') {
                overload = 5;
            } else if (gear.quality === 'common') {
                overload = 10;
            } else if (gear.quality === 'poor') {
                overload = 15;
            }

            DarkHeresy['overload_target'] = overload;
            DarkHeresy['overload'] = DarkHeresy.roll <= overload;
        }

        DarkHeresy['gear_target'] = gear_target;
        DarkHeresy['success'] = DarkHeresy.roll <= calculateModifierArray(gear_target);
    }

    function createGearResults(DarkHeresy) {
        const power_card = [];

        power_card.push('--bgcolor|#F17F29');
        power_card.push('--orowbg|#6C91C2');
        power_card.push('--erowbg|#6C91C2');

        power_card.push('--tokenid|' + DarkHeresy.source);
        power_card.push('--leftsub|' + DarkHeresy.gear.name + ' (' + DarkHeresy.gear.quality + ')');
        power_card.push('--rightsub|' + DarkHeresy.gear_action);

        if(DarkHeresy.gear_action === 'activate') {
            power_card.push('--name|' + DarkHeresy.character.get('name') + ' ' + DarkHeresy.gear.flavor);

            if (DarkHeresy.gear.forceField) {
                power_card.push('--api_token-mod|_ids ' + DarkHeresy.source + ' _ignore-selected _set statusmarkers|aura');
                power_card.push('--Force Field|' + DarkHeresy.character.get('name') + ' activates their force field. (' + DarkHeresy.gear.activation + ' action)');
            }

        } else if (DarkHeresy.gear_action === 'deactivate') {
            power_card.push('--name|' + DarkHeresy.character.get('name') + ' deactivates ' + DarkHeresy.gear.name);

            if (DarkHeresy.gear.forceField) {
                power_card.push('--api_token-mod|_ids ' + DarkHeresy.source + ' _ignore-selected _set statusmarkers|-aura');
                power_card.push('--Force Field|' + DarkHeresy.character.get('name') + ' de-activates their force field. (' + DarkHeresy.gear.activation + ' action)');
            }

        } else if (DarkHeresy.gear_action === 'check') {
            power_card.push('--name| A ' + DarkHeresy.gear.name + ' activates for ' + DarkHeresy.character.get('name') + '.');
            power_card.push('--Roll| Rolled an **' + DarkHeresy.roll + '** against a target of ' + arrayToCardText(DarkHeresy.gear_target) + '!');

            if(DarkHeresy.success) {
                if(DarkHeresy.gear.forceField) {
                    if(DarkHeresy.overload) {
                        power_card.push('--Overload|The attack is dispersed across the field and then **overloads!** The field ceases to function until recharged or repaired.');
                    } else {
                        power_card.push('--Dispersal|The attack is dispersed across the field causing **no** damage!');
                    }
                }
            } else {
                if(DarkHeresy.gear.forceField) {
                    power_card.push('--Crackle|The field crackles and **fails** to prevent the damage from passing through!');
                }
            }
        }

        DarkHeresy['power_card'] = power_card;
    }

    function validateAndUpdatePsykanaAction(DarkHeresy) {
        // Check Effective Rating
        if(DarkHeresy.effective_rating === undefined) {
            sendChat("", "/w " + DarkHeresy.msg.who + " Psykana action requires effective_rating.");
            return false;
        }

        // Check Character
        if(DarkHeresy.character === undefined) {
            sendChat("", "/w " + DarkHeresy.msg.who + " Psykana action requires valid character_id or source token object.");
            return false;
        }

        // Check Psykana
        if(DarkHeresy.psykana === undefined) {
            sendChat("", "/w " + DarkHeresy.msg.who + " Psykana action requires valid psykana object.");
            return false;
        }

        // Update Psyker Rating
        DarkHeresy['psyker_rating'] = getAttrByName(DarkHeresy.character_id, 'PsyRating');
        if(DarkHeresy.psyker_rating === undefined) {
            sendChat("", "/w " + DarkHeresy.msg.who + " Psykana action requires valid psyker_rating.");
            return false;
        }

        // Create Weapon object
        if(DarkHeresy.psykana.class === 'damage') {
            DarkHeresy.weapon = DarkHeresy.psykana.weapon(DarkHeresy);
            DarkHeresy.weapon['name'] = DarkHeresy.psykana.name;
            DarkHeresy['melee'] = false;
            DarkHeresy['attack_type'] = DarkHeresy.weapon.class;

            determineWeaponDistance(DarkHeresy);
        }

        return true;
    }

    function calculatePsykanaTarget(DarkHeresy) {
        let psykana_target = [];
        let psykana = DarkHeresy.psykana;

        // Extra Modifier
        if (DarkHeresy.modifier !== undefined) {
            addToModifierArray(psykana_target, 'modifier', DarkHeresy.modifier);
        }

        // Attribute
        let wp = getStat(DarkHeresy.character_id, "Willpower", "UnWP");
        addToModifierArray(psykana_target, 'willpower', wp.stat);

        // Psy Rating Modifier
        addToModifierArray(psykana_target, 'psy rating modifier', (DarkHeresy.psyker_rating - DarkHeresy.effective_rating) * 10);

        // Psykana Modifier
        if(psykana.focusPower) {
            addToModifierArray(psykana_target, 'focus power', psykana.focusPower);
        }

        DarkHeresy['psykana_target'] = psykana_target;
        DarkHeresy['weapon_target'] = psykana_target;
    }

    async function handleBasicPsykanaActivation(DarkHeresy) {
        let roll = DarkHeresy.roll;
        let mod_target = calculateModifierArray(DarkHeresy.psykana_target);

        // Determine if a hit succeeds
        let hit = roll === 1 || roll <= mod_target && roll !== 100;

        // Psykana Successes
        if (hit) {
            const degrees_of_success = (Math.floor(mod_target / 10) - Math.floor(roll / 10)) + 1;
            DarkHeresy['degrees_of_success'] = degrees_of_success;
        } else {
            if (roll === 100) {
                DarkHeresy['automatic_failure'] = true;
                DarkHeresy['failure'] = true;
            } else {
                DarkHeresy['degrees_of_failure'] = (Math.floor(roll / 10) - Math.floor(mod_target / 10)) + 1;
                DarkHeresy['failure'] = true;
            }
        }
    }

    function createPsykanaResults(DarkHeresy) {
        const power_card = [];

        power_card.push('--bgcolor|#001524');
        power_card.push('--orowbg|#FFECD1');
        power_card.push('--erowbg|#FFECD1');

        power_card.push('--tokenid|' + DarkHeresy.source);
        power_card.push('--leftsub|' + DarkHeresy.psykana.name);
        power_card.push('--rightsub|' + DarkHeresy.psyker_rating + '(' + DarkHeresy.effective_rating + ')');

        if(DarkHeresy.psykana.class === 'damage') {
            power_card.push('--emote|VS');
            if (DarkHeresy.psykana.flavor) {
                power_card.push('--name|' + DarkHeresy.character.get('name') + ' ' + DarkHeresy.psykana.flavor + ' ' + DarkHeresy.target_name + '!');
            } else {
                power_card.push('--name|' + DarkHeresy.character.get('name') + ' focuses a power at ' + DarkHeresy.target_name + '!');
            }

            if(DarkHeresy.target_token) {
                power_card.push('--target_list|' + DarkHeresy.target_token);
            }

            if((DarkHeresy.psyker_rating < DarkHeresy.effective_rating) && !/^(.)\1+$/.test(DarkHeresy.roll)) {
                power_card.push('--Psychic Phenomena| **The warp convulses with energy**');
            } else if (/^(.)\1+$/.test(DarkHeresy.roll)) {
                power_card.push('--Psychic Phenomena| **The warp convulses with energy**');
            }

            if(DarkHeresy.weapon.range === 0) {
                power_card.push('--Range| Emits from self.');
            } else if(DarkHeresy.range && DarkHeresy.range > DarkHeresy.weapon.range) {
                power_card.push('--Out of Range| Range of //' + DarkHeresy.range + '// with a max of //' + DarkHeresy.weapon.range + '//! The attack fails!');
                DarkHeresy.power_card = power_card;
                return;
            } else {
                power_card.push('--Range| Range of //' + DarkHeresy.range + '// with a max of //' + DarkHeresy.weapon.range + '//');
            }

            /** Weapon Special **/
            power_card.push(...createWeaponSpecialResults(DarkHeresy));
            power_card.push('--Psykic Roll| Rolled a **' + DarkHeresy.roll + '** vs a modified target of **' + arrayToCardText(DarkHeresy.psykana_target) + '**');

            if (DarkHeresy.failure) {
                if (DarkHeresy.automatic_failure) {
                    power_card.push('--Automatic Failure| Fumbling the attempt resulted in an **automatic failure**!');
                } else {
                    power_card.push('--Failure| The psykana failed with **' + DarkHeresy.degrees_of_failure + '** degrees of failure!');
                }
            } else {
                if(DarkHeresy.psykana.effect) {
                    power_card.push(DarkHeresy.psykana.effect(DarkHeresy));
                }

                if(DarkHeresy.degrees_of_success > 0) {
                    power_card.push('--Degrees of Success| **' + DarkHeresy.degrees_of_success + '** degrees of success!');
                }
                if(DarkHeresy.additional_hits > 0) {
                    power_card.push('--Additional Hits| Scored **' + DarkHeresy.additional_hits + '** additional hits!');
                }
                for(let i = 0; i < DarkHeresy.hits.length; i++) {
                    const hit = DarkHeresy.hits[i];
                    if (calculateModifierArray(hit.damage_array) > 0) {
                        let index = '';
                        let hit_text = '';
                        if (i === 0) {
                            hit_text = '--Damage ' + index + '| ';
                        } else {
                            hit_text = '--Additional Hit ' + index + '| ';
                        }
                        power_card.push(hit_text + 'The target is hit in the //' + hit.hit_location + '// for ' + arrayToCardText(hit.damage_array) + ' damage (//' + DarkHeresy.weapon.damageType + '//) with ' + arrayToCardText(hit.penetration) + ' penetration!');
                    }
                }
            }
        } else if (DarkHeresy.psykana.class === 'concentration') {
            power_card.push('--name|' + DarkHeresy.source.get('name') + ' manifests the power of ' + DarkHeresy.psykana.name + '!');
            if(DarkHeresy.psykana.range) power_card.push('--Range| Max range of ' + DarkHeresy.psykana.range(DarkHeresy));
            power_card.push('--Psykic Roll| Rolled a **' + DarkHeresy.roll + '** vs a modified target of **' + arrayToCardText(DarkHeresy.psykana_target) + '**');

            if (DarkHeresy.failure) {
                if (DarkHeresy.automatic_failure) {
                    power_card.push('--Automatic Failure| Fumbling the attempt resulted in an **automatic failure**!');
                } else {
                    power_card.push('--Failure| The psykana failed with **' + DarkHeresy.degrees_of_failure + '** degrees of failure!');
                }
            } else {
                if(DarkHeresy.psykana.effect) {
                    power_card.push(DarkHeresy.psykana.effect(DarkHeresy));
                }
            }
        }

        DarkHeresy.power_card = power_card;
    }

    function validateAndUpdateWeaponAction(DarkHeresy) {
        // Check Weapon
        if(DarkHeresy.weapon === undefined || DarkHeresy.weapon.class === undefined) {
            sendChat("", "/w " + DarkHeresy.msg.who + " Weapon action requires valid weapon object.");
            return false;
        }

        // Check Character
        if(DarkHeresy.character === undefined) {
            sendChat("", "/w " + DarkHeresy.msg.who + " Weapon action requires valid character_id or source token object.");
            return false;
        }

        // Update Weapon Variables
        DarkHeresy['melee'] = DarkHeresy.weapon.class === 'melee';

        // Default to Standard Attack
        if(!DarkHeresy.attack_type) {
            DarkHeresy.attack_type = 'standard';
        }

        // Update Weapon with Ammo Overrides
        if(DarkHeresy.ammo !== undefined && DarkHeresy.ammo.weapon !== undefined) {
            let special = {}
            if(DarkHeresy.ammo.weapon.special) {
                special = {...DarkHeresy.weapon.special, ...DarkHeresy.ammo.weapon.special}
            }

            DarkHeresy.weapon = {...DarkHeresy.weapon, ...DarkHeresy.ammo.weapon}
            DarkHeresy.weapon.special = special;
        }
        return true;
    }

    function calculateWeaponTarget(DarkHeresy) {
        let weapon_target = [];
        let weapon = DarkHeresy.weapon;

        // Extra Modifier
        if (DarkHeresy.modifier) {
            addToModifierArray(weapon_target, 'modifier', DarkHeresy.modifier);
        }

        // Attribute to use
        if (!DarkHeresy.melee) {
            let bs = getStat(DarkHeresy.character_id, "BallisticSkill", "UnBS");
            addToModifierArray(weapon_target, 'ballistic skill', bs.stat);
            // Calculate Weapon range if Thrown
            if (weapon.class === 'thrown') {
                const statBonus = getStatBonus(DarkHeresy.character_id, 'Strength', 'UnS');
                weapon.range = statBonus * 3;
            }

            // Maximal
            if (DarkHeresy.attack_type === 'maximal') {
                weapon.range += 10;

                if(!weapon.special) weapon.special = {};

                weapon.special['recharge'] = true;
                if (weapon.special.blast) {
                    weapon.special.blast += 2;
                } else {
                    weapon.special['blast'] = 2;
                }
            }

            // Distance Bonus
            if (DarkHeresy.range) {
                determineWeaponDistance(DarkHeresy);
                addToModifierArray(weapon_target, 'distance bonus', DarkHeresy.range_bonus);

                // Scatter
                if(hasWeaponSpecial(DarkHeresy, 'scatter')) {
                    if(DarkHeresy.range_name === 'point blank' || DarkHeresy.range_name === 'short range') {
                        addToModifierArray(weapon_target, 'scatter', 10);
                    }
                }
            }

            // Indirect
            if(hasWeaponSpecial(DarkHeresy, 'indirect')) {
                addToModifierArray(weapon_target, 'accurate', -10);
            }

            // Twin-Linked
            if(hasWeaponSpecial(DarkHeresy, 'twin-linked')) {
                addToModifierArray(weapon_target, 'twin-linked', 20);
            }
        } else {
            let ws = getStat(DarkHeresy.character_id, "WeaponSkill", "UnWS");
            addToModifierArray(weapon_target, 'weapon skill', ws.stat);
        }

        // Defensive
        if(hasWeaponSpecial(DarkHeresy, 'defensive')) {
            addToModifierArray(weapon_target, 'defensive', -10);
        }

        // Compute Aiming Bonus
        if (DarkHeresy.aim && !hasWeaponSpecial(DarkHeresy, 'inaccurate')) {
            if (DarkHeresy.aim === 'half') {
                addToModifierArray(weapon_target, 'half aim', 10);
            } else if (DarkHeresy.aim === 'full') {
                addToModifierArray(weapon_target, 'full aim', 20);
            }

            if (hasWeaponSpecial(DarkHeresy, 'accurate')) {
                addToModifierArray(weapon_target, 'accurate', 10);
            }
        }


        // Ammo Change
        if(DarkHeresy.ammo && DarkHeresy.ammo.attack) {
            addToModifierArray(weapon_target, DarkHeresy.ammo.name, DarkHeresy.ammo.attack);
        }

        // Custom Grip
        if (hasWeaponSpecial(DarkHeresy, 'custom-grip')) {
            addToModifierArray(weapon_target, 'custom grip', 5);
        }

        // Attack Types
        if (DarkHeresy.attack_type === 'standard') {
            addToModifierArray(weapon_target, 'standard attack', 10);

            // Red Dot Sight
            if (hasWeaponSpecial(DarkHeresy, 'red-dot') && DarkHeresy.range > 1) {
                addToModifierArray(weapon_target, 'red dot', 10);
            }
        } else if (DarkHeresy.attack_type === 'charge') {
            addToModifierArray(weapon_target, 'charge attack', 20);
        } else if (DarkHeresy.attack_type === 'fullauto') {
            addToModifierArray(weapon_target, 'full auto attack', -10);
        } else if (DarkHeresy.attack_type === 'lightning'
            && !hasWeaponSpecial(DarkHeresy, 'unbalanced')
            && !hasWeaponSpecial(DarkHeresy, 'unwieldy')) {
            addToModifierArray(weapon_target, 'lightning attack', -10);
        } else if (DarkHeresy.attack_type === 'all-out') {
            addToModifierArray(weapon_target, 'all out attack', 30);
        }
        DarkHeresy['weapon_target'] = weapon_target;
    }

    async function handleWeaponAttack(DarkHeresy) {
        const weapon = DarkHeresy.weapon;
        let roll = DarkHeresy.roll;
        let mod_target = calculateModifierArray(DarkHeresy.weapon_target);

        // Determine if a hit succeeds
        let hit = roll === 1 || roll <= mod_target && roll !== 100;

        // Ranged Things
        if (!DarkHeresy.melee) {
            // Weapon Jams/Overheating
            if(hasWeaponSpecial(DarkHeresy, 'overheats')) {
                if(roll > 91) {
                    DarkHeresy['overheat'] = true;
                }
            } else {
                if ((!hasWeaponSpecial(DarkHeresy, 'reliable') && roll > 96) || roll === 100) {
                    DarkHeresy['jam'] = true;
                }
            }

            // Calculate Ammo Used
            let ammo_used = -1;
            if (DarkHeresy.attack_type === 'semiauto') {
                ammo_used *= weapon.semi;
            } else if (DarkHeresy.attack_type === 'fullauto') {
                ammo_used *= weapon.full;
            }
            if (DarkHeresy.ammo && DarkHeresy.ammo.ammo) {
                ammo_used *= DarkHeresy.ammo.ammo;
            }
            if (DarkHeresy.attack_type === 'maximal') {
                ammo_used *= 3;
            }
            if (hasWeaponSpecial(DarkHeresy, 'twin-linked')) {
                ammo_used *= 2;
            }
            DarkHeresy['ammo_used'] = ammo_used;
        } else {
            // Melee Things

            // Check Blademaster
            if (!hit && hasTalent(DarkHeresy.character_id, 'Blademaster')) {
                DarkHeresy['blademaster'] = true;
                // Store and retry hit
                DarkHeresy['original_roll'] = roll;
                roll = randomInteger(100);
                DarkHeresy.roll = roll;
                hit = roll === 1 || roll <= mod_target && roll !== 100;
            }

            // Check HammerBlow
            if (DarkHeresy.attack_type === 'all-out' && hasTalent(DarkHeresy.character_id, 'Hammer Blow')) {
                DarkHeresy['hammer_blow'] = true;

                // Adds Concussive
                if(!weapon.special) weapon.special = {};
                weapon.special['concussive'] = 2;
            }
        }

        // Get Hit Location
        let hitLocation = determineHitLocation(roll);

        // Weapon Hits
        if (hit) {
            const degrees_of_success = (Math.floor(mod_target / 10) - Math.floor(roll / 10)) + 1;
            DarkHeresy['degrees_of_success'] = degrees_of_success;
            DarkHeresy['hits'] = [];
            let additionalHits = 0;

            if(degrees_of_success > 1 && hasWeaponSpecial(DarkHeresy, 'twin-linked')) {
                additionalHits += 1;
            }

            if (DarkHeresy.attack_type === 'semiauto' || DarkHeresy.attack_type === 'swift' || DarkHeresy.attack_type === 'barrage') {
                additionalHits += Math.floor((degrees_of_success - 1) / 2);
                // Max at the semi rate
                if (weapon.rateOfFire && additionalHits > weapon.rateOfFire.burst - 1) {
                    additionalHits = weapon.rateOfFire.burst - 1;
                }

                // Storm
                if(hasWeaponSpecial(DarkHeresy, 'storm')) {
                    additionalHits *= 2;
                    DarkHeresy.ammo_used *= 2;
                }

                DarkHeresy['additional_hits'] = additionalHits;
            } else if ((DarkHeresy.attack_type === 'fullauto' || DarkHeresy.attack_type === 'lightning' || DarkHeresy.attack_type === 'storm')
                && !hasWeaponSpecial(DarkHeresy, 'unbalanced') && !hasWeaponSpecial(DarkHeresy, 'unwieldy')) {
                additionalHits += Math.floor((degrees_of_success - 1));
                // Max at the full rate
                if (weapon.rateOfFire && additionalHits > weapon.rateOfFire.full - 1) {
                    additionalHits = weapon.rateOfFire.full - 1;
                }

                // Storm
                if(hasWeaponSpecial(DarkHeresy, 'storm')) {
                    additionalHits *= 2;
                    DarkHeresy.ammo_used *= 2;
                }

                DarkHeresy['additional_hits'] = additionalHits;
            }

            // Handle Hits
            await handleWeaponHit(DarkHeresy, hitLocation);
            for (let i = 0; i < additionalHits; i++) {
                hitLocation = nextHitLocation(hitLocation);
                await handleWeaponHit(DarkHeresy, hitLocation);
            }

        } else {
            if (roll === 100) {
                DarkHeresy['automatic_failure'] = true;
                DarkHeresy['failure'] = true;
            } else {
                DarkHeresy['degrees_of_failure'] = (Math.floor(roll / 10) - Math.floor(mod_target / 10)) + 1;
                DarkHeresy['failure'] = true;
            }

            if (weapon.class === 'thrown') {
                await handleWeaponHit(DarkHeresy, hitLocation);
            }
        }
    }

    async function handleWeaponHit(DarkHeresy, hit_location) {
        // Damage
        let damage = await new Promise(function (resolve, reject) {
            sendChat(DarkHeresy.msg.who, "/roll " + DarkHeresy.weapon.damage, async function (ops) {
                const content = JSON.parse(ops[0]['content']);
                resolve(await determineWeaponDamage(DarkHeresy, content));
            });
        });

        // Penetration
        let penetration = determineWeaponPenetration(DarkHeresy);

        if (!DarkHeresy.hits) {
            DarkHeresy['hits'] = [];
        }

        DarkHeresy.hits.push({ ...damage, penetration, hit_location });
    }

    async function determineWeaponDamage(DarkHeresy, content) {
        let critical_hits = 0;
        let damage = content.total;

        const weapon = DarkHeresy.weapon;
        const degrees_of_success = DarkHeresy.degrees_of_success;
        const damage_array = [];

        // Rolls
        const crits = [];
        if (content.rolls) {
            let righteous_fury = 10;
            if(hasWeaponSpecial(DarkHeresy, 'vengeful')){
                righteous_fury = DarkHeresy.weapon.special.vengeful;
            }
            content.rolls.forEach(roll => {
                if(roll.type === 'R') {
                    if (roll.results.v >= righteous_fury) {
                        crits.push(randomInteger(5));
                    }

                    // Lower to Primitive
                    if (hasWeaponSpecial(DarkHeresy, 'primitive')) {
                        if (roll.results.v > weapon.special.primitive) {
                            addToModifierArray(damage_array, 'primitive', weapon.special.primitive - roll.results.v);
                        }
                    }

                    // Update Damage to proven amount
                    if (hasWeaponSpecial(DarkHeresy, 'proven')) {
                        if (roll.results.v < weapon.special.proven) {
                            addToModifierArray(damage_array, 'proven', weapon.special.proven - roll.results.v);
                        }
                    }
                }
            })
        }

        // Base Damage
        addToModifierArray(damage_array, 'base (' + weapon.damage + ')', damage);

        // Manual Additional Damage
        if (DarkHeresy.additional_damage) {
            const manual = parseInt(DarkHeresy.additional_damage);
            if (manual > 0) {
                addToModifierArray(damage_array, 'extra damage', manual);
            }
        }

        // Melee
        if (DarkHeresy.melee) {
            // Melee Strength Bonus
            const stat_bonus = getStatBonus(DarkHeresy.character_id, 'Strength', 'UnS');
            addToModifierArray(damage_array, 'strength bonus', stat_bonus);

            // Crushing Blow Talent
            if (hasTalent(DarkHeresy.character_id, 'Crushing Blow')) {
                const stat_bonus = getStatBonus(DarkHeresy.character_id, 'WeaponSkill', 'UnWS');
                const bonus = Math.ceil(stat_bonus / 2);
                addToModifierArray(damage_array, 'crushing blow', bonus);
            }
        } else {
            // Ranged

            // Scatter Weapons
            if (hasWeaponSpecial(DarkHeresy, 'scatter')) {
                if (DarkHeresy.range_name === 'point blank') {
                    addToModifierArray(damage_array, 'scatter', 3);
                } else if (DarkHeresy.range_name !== 'short range')  {
                    addToModifierArray(damage_array, 'scatter', -3);
                }
            }

            // Add Accurate Damage
            if (hasWeaponSpecial(DarkHeresy, 'accurate')) {
                if (degrees_of_success >= 5) {
                    const accurate_one = randomInteger(10);
                    if (accurate_one === 10) critical_hits++;
                    addToModifierArray(damage_array, 'accurate', accurate_one);
                }
                if (degrees_of_success >= 3) {
                    const accurate_two = randomInteger(10);
                    if (accurate_two === 10) critical_hits++;
                    addToModifierArray(damage_array, 'accurate', accurate_two);
                }
            }

            // Might Shot Bonus
            if (hasTalent(DarkHeresy.character_id, 'Mighty Shot')) {
                const stat_bonus = getStatBonus(DarkHeresy.character_id, 'BallisticSkill', 'UnBS');
                const bonus = Math.ceil(stat_bonus / 2);
                addToModifierArray(damage_array, 'mighty shot', bonus);
            }

            // Maximal
            if (DarkHeresy.attack_type === 'maximal') {
                addToModifierArray(damage_array, 'maximal', randomInteger(10));
            }

            // Add Ammo Bonus
            if (DarkHeresy.ammo && DarkHeresy.ammo.damage) {
                let damage = Number(DarkHeresy.ammo.damage);
                if(Number.isInteger(damage)) {
                    addToModifierArray(damage_array, DarkHeresy.ammo.name, damage);
                } else {
                    damage = await new Promise(function (resolve, reject) {
                        sendChat(DarkHeresy.msg.who, "/roll " + DarkHeresy.ammo.damage, async function (ops) {
                            const content = JSON.parse(ops[0]['content']);
                            resolve(content.total);
                        });
                    });
                    addToModifierArray(damage_array, DarkHeresy.ammo.name, damage);
                }
            }
        }

        return { damage_array, crits }
    }

    function determineWeaponPenetration(DarkHeresy) {
        const weapon = DarkHeresy.weapon;
        const penetration_array = [];

        // Base Weapon Pen
        addToModifierArray(penetration_array, 'weapon', weapon.penetration ? weapon.penetration : 0)

        // Melee
        if(DarkHeresy.melee) {

            // Lance
            if(weapon.penetration && DarkHeresy.degrees_of_success > 0 && hasWeaponSpecial(DarkHeresy, 'lance')) {
                addToModifierArray(penetration_array, 'lance', weapon.penetration * DarkHeresy.degrees_of_success)
            }

            // Mono Weapon
            if (hasWeaponSpecial(DarkHeresy, 'mono')) {
                addToModifierArray(penetration_array, 'mono', 2);
            }

            // Razor Sharp
            if (hasWeaponSpecial(DarkHeresy, 'razer-sharp') && DarkHeresy.degrees_of_success > 2) {
                penetration_array.push({
                    name: 'razor sharp',
                    multiple: 2
                });
            }

            // Hammer Blow
            if (DarkHeresy['hammer_blow']) {
                const stat_bonus = getStatBonus(DarkHeresy.character_id, 'Strength', 'UnS');
                addToModifierArray(penetration_array, 'hammer blow', stat_bonus);
            }

        } else {
            // Ranged

            // Ammo
            if (DarkHeresy.ammo && DarkHeresy.ammo.penetration) {
                let pen = Number(DarkHeresy.ammo.penetration);
                if(Number.isInteger(pen)) {
                    addToModifierArray(penetration_array, DarkHeresy.ammo.name, pen)
                }
            }

            // Melta
            if (hasWeaponSpecial(DarkHeresy, 'melta') &&
                (DarkHeresy.range_name === 'short range' || DarkHeresy.range_name === 'point blank')) {
                penetration_array.push({
                    name: 'melta',
                    multiple: 2
                });
            }

            // Maximal
            if (DarkHeresy.attack_type === 'maximal') {
                addToModifierArray(penetration_array, 'maximal', 2);
            }
        }

        return penetration_array;
    }

    function createWeaponResults(DarkHeresy) {
        const power_card = [];

        power_card.push('--bgcolor|#373F47');
        power_card.push('--orowbg|#6C91C2');
        power_card.push('--erowbg|#6C91C2');
        power_card.push('--emote|VS');

        power_card.push('--name|' + DarkHeresy.character.get('name') + ' is attacking ' + DarkHeresy.target_name + '!');
        power_card.push('--tokenid|' + DarkHeresy.source);
        power_card.push('--target_list|' + DarkHeresy.target);

        if (!DarkHeresy.melee) {
            power_card.push('--Range| Range of ' + DarkHeresy.range + 'm for a bonus of ' + DarkHeresy.range_bonus);
        }

        power_card.push('--leftsub|' + DarkHeresy.weapon.name + ' (' + DarkHeresy.weapon.class + ')');
        power_card.push('--rightsub|' + DarkHeresy.attack_type + ' attack');

        /*** Talents ***/
        // Check Blademaster
        if (DarkHeresy.blademaster) {
            power_card.push('--Blademaster| Original roll of **' + DarkHeresy.original_roll + '** rerolled due to //Blademaster//!');
        }

        /** Weapon Special **/
        power_card.push(...createWeaponSpecialResults(DarkHeresy));

        // Overheating
        if(DarkHeresy.overheat) {
            power_card.push('--Overheats| The weapon overheats causing its damage to ' + DarkHeresy.character.get('name') + ' and forcing it to be dropped on the ground!');
        }

        power_card.push('--Attack| Rolled a **' + DarkHeresy.roll + '** vs a modified target of ' + arrayToCardText(DarkHeresy.weapon_target) + '');

        if (DarkHeresy.jam) {
            if (DarkHeresy.weapon.class === 'thrown') {
                const thrownJam = randomInteger(10);
                if (thrownJam === 10) {
                    power_card.push('--Fumble| The grenade fumbles in the attackers hands and explodes!');
                    const hit = DarkHeresy.hits[0];
                    if (calculateModifierArray(hit.damage_array) > 0) {
                        power_card.push('--Damage| It explodes hitting in the //' + hit.hit_location + '// for ' + arrayToCardText(hit.damage_array) + ' damage (//' + DarkHeresy.weapon.damageType + '//) with ' + arrayToCardText(hit.penetration) + ' penetration!');
                    }
                } else {
                    power_card.push('--Fumble| The grenade fumbles in the attackers hands! But just drops to the ground. A dud.');
                }
            } else {
                power_card.push('--Jam| The weapon //jams//!');
            }
        } else if (DarkHeresy.failure) {
            if (DarkHeresy.weapon.class === 'thrown') {
                power_card.push('--Miss| The grenade deviates from its intended course. Scattering [[1d5]] meters to the ' + scatterDirection() + '!');
                const hit = DarkHeresy.hits[0];
                if (calculateModifierArray(hit.damage_array) > 0) {
                    power_card.push('--Damage| It explodes hitting in the //' + hit.hit_location + '// for ' + arrayToCardText(hit.damage_array) + ' damage (//' + DarkHeresy.weapon.damageType + '//) with ' + arrayToCardText(hit.penetration) + ' penetration!');
                }
            } else {
                if (DarkHeresy.automatic_failure) {
                    power_card.push('--Automatic Failure| Fumbling the attack resulted in an **automatic failure**!');
                } else {
                    power_card.push('--Failure| The attack failed with **' + DarkHeresy.degrees_of_failure + '** degrees of failure!');
                }
            }
        } else {
            if (DarkHeresy.degrees_of_success > 0) {
                power_card.push('--Degrees of Success| Hit with **' + DarkHeresy.degrees_of_success + '** degrees of success!');
            }
            if (DarkHeresy.additional_hits > 0) {
                power_card.push('--Additional Hits| Scored **' + DarkHeresy.additional_hits + '** additional hits!');
            }

            for (let i = 0; i < DarkHeresy.hits.length; i++) {
                const hit = DarkHeresy.hits[i];
                if (calculateModifierArray(hit.damage_array) > 0) {
                    let index = '';
                    let hit_text = '';

                    if (i === 0) {
                        hit_text = '--Damage ' + index + '| ';
                    } else {
                        hit_text = '--Additional Hit ' + index + '| ';
                    }

                    hit_text += 'The target is hit in the //' + hit.hit_location + '// ';

                    if (!DarkHeresy.melee && DarkHeresy.ammo && DarkHeresy.ammo.special) {
                        let extra = '';
                        if (DarkHeresy.ammo.special) {
                            extra = '(' + DarkHeresy.ammo.special + ') ';
                        }
                        hit_text += 'with ' + hit.ammo_name + ' ' + extra;
                    }

                    power_card.push(hit_text + 'for ' + arrayToCardText(hit.damage_array) + ' damage (//' + DarkHeresy.weapon.damageType + '//) with ' + arrayToCardText(hit.penetration) + ' penetration!');
                }
            }
        }

        DarkHeresy.power_card = power_card;
    }

    function createWeaponSpecialResults(DarkHeresy) {
        const power_card = [];
        // Weapon Special
        let weapon_special = '';
        if (DarkHeresy.weapon && DarkHeresy.weapon.special) {
            for (let key of Object.keys(DarkHeresy.weapon.special)) {
                if (Number.isInteger(DarkHeresy.weapon.special[key])) {
                    weapon_special += key[0].toUpperCase() + key.substring(1) + '(' + DarkHeresy.weapon.special[key] + '),';
                } else {
                    weapon_special += key[0].toUpperCase() + key.substring(1) + ',';
                }
            }
        }

        if (weapon_special.length > 0) {
            const pieces = weapon_special.split(',');
            const lastPiece = pieces.pop();
            power_card.push('--Special|' + pieces.join(', ') + lastPiece + '');
        }

        // Check Blast
        if (hasWeaponSpecial(DarkHeresy, 'blast')) {
            power_card.push('--Blast| Everyone within **' + DarkHeresy.weapon.special.blast + 'm** of the location is hit!');
        }
        // Check Concussive
        if (hasWeaponSpecial(DarkHeresy, 'concussive')) {
            power_card.push('--Concussive| Target must pass Toughness test with **' + -10 * DarkHeresy.weapon.special.concussive + '** or be //Stunned// for 1 round per DoF. If the attack did more damage than the targets Strength Bonus, it is knocked //Prone//!');
        }
        // Check Corrosive
        if (hasWeaponSpecial(DarkHeresy, 'corrosive')) {
            power_card.push('--Corrosive| The targets armor melts with **[[1d10]]** of armour being destroyed! Additional damage is dealt as wounds and not reduced by toughness.');
        }
        // Check Crippling
        if (hasWeaponSpecial(DarkHeresy, 'crippling')) {
            power_card.push('--Crippling| If the target suffers a wound it is considered crippled. If they take more than a half action on a turn, they suffer **' + DarkHeresy.weapon.special.crippling + '** damage not reduced by Armour or Toughness!');
        }
        // Check Felling
        if (hasWeaponSpecial(DarkHeresy, 'felling')) {
            power_card.push('--Felling| The targets unnatural toughness is reduced by **' + DarkHeresy.weapon.special.felling + '** while calculating wounds!');
        }
        // Check Flame
        if (hasWeaponSpecial(DarkHeresy, 'flame')) {
            power_card.push('--Flame| The target must make an Agility test or be set on //fire//!');
        }
        // Check Graviton
        if (hasWeaponSpecial(DarkHeresy, 'graviton')) {
            power_card.push('--Graviton| This attack deals additional damage equal to the targets Armour points on the struck location!');
        }
        // Check Hallucinogenic
        if (hasWeaponSpecial(DarkHeresy, 'hallucinogenic')) {
            power_card.push('--Hallucinogenic| A creature stuck by this much make a toughness test with **' + -10 * DarkHeresy.weapon.special.hallucinogenic + '** or suffer a delusion!');
        }
        // Check Haywire
        if (hasWeaponSpecial(DarkHeresy, 'haywire')) {
            power_card.push('--Haywire| Everything within **' + -10 * DarkHeresy.weapon.special.haywire + 'm** suffers the Haywire Field at strength //[[1d10]]//!');
        }
        // Check Indirect
        if (hasWeaponSpecial(DarkHeresy, 'indirect')) {
            let bs = getStat(DarkHeresy.character_id, 'BallisticSkill', 'UnBS')
            power_card.push('--Indirect| The attack deviates **[[ 1d10 - ' + bs.stat + ']]m** (minimum of 0m) off course to the ' + scatterDirection() + '!');
        }
        // Check Snare
        if (hasWeaponSpecial(DarkHeresy, 'snare')) {
            power_card.push('--Snare| Target must pass Agility test with **' + -10 * DarkHeresy.weapon.special.snare + '** or become immobilised. An immobilised target can attempt no actions other than trying to escape. As a Full Action, they can make a Strength or Agility test with **' + -10 * DarkHeresy.weapon.special.snare + '** to burst free or wriggle out.');
        }
        // Check Toxic
        if (hasWeaponSpecial(DarkHeresy, 'toxic')) {
            power_card.push('--Toxic| Target must pass Toughness test with **' + -10 * DarkHeresy.weapon.special.toxic + '** or suffer [[1d10]] ' + DarkHeresy.weapon.damageType + ' damage.');
        }
        // Check Warp Weapon
        if (hasWeaponSpecial(DarkHeresy, 'warp')) {
            power_card.push('--Warp Weapon| **Ignores mundane armor and cover!** Holy armor negates this.');
        }
        return power_card;
    }

    function handleAmmo(DarkHeresy) {
        if(DarkHeresy.ammo_used === undefined) return;
        const msg = {
            playerid: DarkHeresy.msg.playerid,
            type: "api"
        }
        const weaponRow = filterObjs(function (obj) {
            return obj.get("type") === 'attribute' && obj.get('characterid') === DarkHeresy.character_id &&
                obj.get('name').indexOf('repeating_rangedweapons') > -1 && obj.get('current') === DarkHeresy.weapon.name;
        });
        if (weaponRow) {
            let name = weaponRow[0].get("name");
            name = name.replace("repeating_rangedweapons_", "");
            name = name.replace("_Rangedweaponname", "");
            msg.content = '!ammo ' + DarkHeresy.character_id + ' repeating_Rangedweapons_' + name + '_Rangedweaponclip ' + DarkHeresy.ammo_used;
            ammoFunction(msg);
        }
    }

    function hasWeaponSpecial(DarkHeresy, special) {
        if (!DarkHeresy.weapon) {
            return false;
        } else {
            return DarkHeresy.weapon.special &&
                DarkHeresy.weapon.special[special] !== undefined &&
                DarkHeresy.weapon.special[special] !== false;
        }
    }

    function determineWeaponDistance(DarkHeresy) {
        const wr = parseInt(DarkHeresy.weapon.range);
        const tr = parseInt(DarkHeresy.range);

        if (tr === 0) {
            DarkHeresy['range_name'] = 'self';
            DarkHeresy['range_bonus'] = 0;
        } else if (tr === 2) {
            DarkHeresy['range_name'] = 'point blank';
            DarkHeresy['range_bonus'] = 30;
        } else if (tr <= (wr / 2)) {
            DarkHeresy['range_name'] = 'short range';
            DarkHeresy['range_bonus'] = 10;
        } else if (tr <= (wr * 2)) {
            DarkHeresy['range_name'] = 'normal range';
            DarkHeresy['range_bonus'] = 0;
        } else if (tr <= (wr * 3)) {
            DarkHeresy['range_name'] = 'long range';
            if (hasWeaponSpecial(DarkHeresy, 'telescopic-sight')) DarkHeresy['range_bonus'] = 0;
            else DarkHeresy['range_bonus'] = -10;
        } else {
            DarkHeresy['range_name'] = 'extreme range';
            if (hasWeaponSpecial(DarkHeresy, 'telescopic-sight')) DarkHeresy['range_bonus'] = 0;
            else DarkHeresy['range_bonus'] = -30;
        }
    }

    function determineHitLocation(roll) {
        const rollString = roll.toString().split("");
        const reverseArray = rollString.reverse();
        const joinArray = reverseArray.join("");

        const reverseInt = parseInt(joinArray);

        if (reverseInt <= 10) {
            return "head";
        } else if (reverseInt <= 20) {
            return "right arm";
        } else if (reverseInt <= 30) {
            return "left arm";
        } else if (reverseInt <= 70) {
            return "body";
        } else if (reverseInt <= 85) {
            return "right leg";
        } else {
            return "left leg";
        }
    }

    function nextHitLocation(location) {
        if (location === 'head') {
            return 'right arm';
        } else if (location === 'right arm') {
            return 'left arm';
        } else if (location === 'left arm') {
            return 'body';
        } else if (location === 'body') {
            return 'right leg';
        } else if (location === 'right leg') {
            return 'left leg';
        } else {
            return 'head';
        }
    }

    function getStatBonus(character_id, stat_name, unnatural) {
        const stats = getStat(character_id, stat_name, unnatural);
        let bonus = Math.floor(stats.stat / 10);
        if (stats.unnatural) {
            bonus += (1 * stats.unnatural);
        }
        return bonus;
    }

    function getStat(character_id, stat_name, unnatural) {
        const stat = filterObjs(function (obj) {
            return !!(obj.get('characterid') === character_id
                && obj.get("type") === 'attribute')
                && obj.get('name') === stat_name
        });

        const un_stat = filterObjs(function (obj) {
            return !!(obj.get('characterid') === character_id
                && obj.get("type") === 'attribute')
                && obj.get('name') === unnatural
        });

        if (!stat || stat.length === 0) {
            return {}
        }

        const statObj = {
            stat: stat[0].get('current')
        }

        if (un_stat && un_stat.length === 1) {
            statObj['unnatural'] = un_stat[0].get('current');
        }

        return statObj;
    }

    function hasTalent(character_id, talent) {
        const talents = filterObjs(function (obj) {
            return !!(obj.get('characterid') === character_id && obj.get("type") === 'attribute' &&
                obj.get('name').indexOf('talent') > -1 && obj.get('current').includes(talent));
        });

        return talents.length > 0;
    }

    function scatterDirection() {
        let direction = '';
        const directionInt = randomInteger(10);
        if (directionInt === 1) direction = 'north west';
        if (directionInt === 2) direction = 'north';
        if (directionInt === 3) direction = 'north east';
        if (directionInt === 4) direction = 'west';
        if (directionInt === 5) direction = 'east';
        if (directionInt === 6 || directionInt === 7) direction = 'south west';
        if (directionInt === 8) direction = 'south';
        if (directionInt === 9 || directionInt === 10) direction = 'south east';
        return direction;
    }

    function addToModifierArray(array, modifier_name, modifier) {
        array.push({
            name: modifier_name,
            value: modifier
        });
    }

    function calculateModifierArray(array) {
        if (array.length === 0) {
            return 0;
        }

        let value = 0;

        let multiples = [];
        for (let i = 0; i < array.length; i++) {
            if (array[i].multiple) {
                multiples.push(array[i]);
            }
        }

        for (let i = 0; i < array.length; i++) {
            if (array[i].multiple) {
                continue;
            }
            let change = Number(array[i].value);
            if(Number.isInteger(change)) {
                value += change;
            }
        }

        for (let i = 0; i < multiples.length; i++) {
            value *= multiples[i].multiple;
        }

        return value;
    }

    function arrayToCardText(array) {
        let value = '[[';
        if (array.length === 0) {
            return '';
        }

        let multiples = [];
        for (let i = 0; i < array.length; i++) {
            if (array[i].multiple) {
                multiples.push(array[i]);
            }
        }
        if (multiples.length > 0) {
            value += '( ';
        }

        for (let i = 0; i < array.length; i++) {
            if (array[i].multiple) {
                continue;
            }
            if (i > 0 && array[i].value >= 0) {
                value += '+ ';
            } else if (i > 0 && array[i].value < 0) {
                value += '- ';
            }
            value += Math.abs(array[i].value) + ' [' + array[i].name + '] ';
        }

        if (multiples.length > 0) {
            value += ' )';
        }

        for (let i = 0; i < multiples.length; i++) {
            value += ' * ' + multiples[i].multiple + ' [' + multiples[i].name + '] ';
        }

        value += ']]';
        return value;
    }

    function getToken(tokenId) {
        return getObj('graphic', tokenId);
    }

    function tokenDistance(token1, token2) {
        if (token1.get('pageid') !== token2.get('pageid')) {
            log('Cannot measure distance between tokens on different pages');
            return;
        }

        const distX_pixels = Math.abs(token1.get('left') - token2.get('left'));
        const distY_pixels = Math.abs(token1.get('top') - token2.get('top'));

        // 70px = 1 unit
        const distX = distX_pixels / 70;
        const distY = distY_pixels / 70;
        let distance;

        const page = getObj('page', token1.get('pageid'));
        const measurement = page.get('diagonaltype');

        switch (measurement) {
            default:
            case 'pythagorean':
                // Euclidean distance, that thing they teach you in school
                distance = Math.sqrt(distX * distX + distY * distY);
                break;
            case 'foure':
                // Distance as used in D&D 4e
                distance = Math.max(distX, distY);
                break;
            case 'threefive':
                // Distance as used in D&D 3.5 and Pathfinder
                distance = 1.5 * Math.min(distX, distY) + Math.abs(distX - distY);
                break;
            case 'manhattan':
                // Manhattan distance
                distance = distX + distY;
                break;
        }

        const gridUnitSize = page.get('snapping_increment'); // units per grid square
        const unitScale = page.get('scale_number'); // scale for 1 unit, eg 1 unit = 5ft
        const unit = page.get('scale_unit'); // unit, eg ft or km

        return {
            distance: distance, // Distance between token1 and token2 in units
            squares: distance / gridUnitSize, // Distance between token1 and token2 in squares
            measurement: unitScale * distance / gridUnitSize,
            measurement_string: '' + (unitScale * distance / gridUnitSize) + unit // Ruler measurement as a string
        };
    }

    return {
        process: DarkHeresy.process
    };
}());
