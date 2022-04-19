const DarkHeresyGear = [
    {
        name: "Refractor Field",
        class: "forceField",
        quality: 'common',
        activation: '1/2',
        forceField: 30,
        flavor: 'is enveloped in a soft glow'
    },
    {
        name: "Conversion Field",
        class: "forceField",
        quality: 'common',
        activation: '1/2',
        forceField: 50,
        flavor: 'is enveloped in a soft glow',
        effect: function (DarkHeresy) {
            return '--Coversion Field| Blocking more than 12 points of damage releases light strong enough to act as a photon flash grenade.';
        }
    },
    {
        name: "Displacer Field",
        class: "forceField",
        quality: 'common',
        activation: '1/2',
        forceField: 55,
        flavor: 'is enveloped in a soft glow',
        effect: function (DarkHeresy) {
            return '--Displacer Field| When the field successfully nullifies an attack, the user jumps in a random direction using the Scatter Diagram. Roll 3d10 for the number of metres travelled—the wearer always emerges on solid footing and in a suitable empty space. If all three dice come up with the same number (e.g., 3 results of 7), then the user does not re-emerge for 1d5 rounds and gains 1 Corruption point from exposure to the unnatural energies within the Warp. If the activation is unexpected, then the wearer cannot act for one round while he regains his sense of place.';
        }
    },
    {
        name: "Power Field (Personal)",
        class: "forceField",
        quality: 'common',
        activation: '1/2',
        forceField: 80,
        flavor: 'is enveloped in a with ripples of energy'
    },
    {
        name: "Power Field (Vehicle/Emplacement)",
        class: "forceField",
        quality: 'common',
        activation: '1/2',
        forceField: 80,
        flavor: 'is enveloped in a with ripples of energy'
    },
]