type GenshinTypeEntity<T> = {
    id: string;
} & {
    [key in keyof T]: T[key];
};
type GenshinVisionName = 'Anemo' | 'Cryo' | 'Electro' | 'Geo' | 'Hydro' | 'Pyro' | 'Dendro';
type GenshinVisionKey = 'ANEMO' | 'CRYO' | 'ELECTRO' | 'GEO' | 'HYDRO' | 'PYRO' | 'DENDRO';
type GenshinWeaponName = 'Claymore' | 'Polearm' | 'Sword' | 'Bow' | 'Catalyst';
type GenshinWeaponKey = 'CLAYMORE' | 'POLEARM' | 'SWORD' | 'BOW' | 'CATALYST';
type GenshinNationName = 'Mondstadt' | 'Unknown' | 'Inazuma' | 'Liyue' | 'Sumeru' | 'Snezhnaya' | 'Outlander';
type GenshinArchonName = 'Baal' | 'Morax' | 'Barbatos';
type GenshinControlledEntityName = 'Inazuma Bakufu' | 'Liyue Qixing' | 'Knights of Favonius';
type GenshinWeaponSubStat = 'ATK' | 'Attack' | 'Elemental Mastery' | '-' | 'Physical DMG Bonus' | 'HP' | 'CRIT DMG' | 'DEF' | 'CRIT Rate' | 'Energy Recharge';
type GenshinWeaponAscensionType = 'distantant-sea' | 'dandelion' | 'aerosiderite' | 'decarabian' | 'guyun' | 'elixir' | 'boreal' | 'mask' | 'narukami';
type GenshinFoodType = 'ATK-Boosting Dish' | 'Recovery Dish' | "Adventurer's Dish" | 'DEF-Boosting Dish';
interface GenshinTalent {
    name: string;
    unlock: string;
    description: string;
}
export interface GenshinSkillTalent extends GenshinTalent {
    upgrades: Array<{
        name: string;
        value: string;
    }>;
}
export interface GenshinPassiveTalent extends GenshinTalent {
    level?: number;
}
export type GenshinConstellation = Omit<GenshinTalent, 'level'> & {
    level: 1 | 2 | 3 | 4 | 5 | 6;
};
export type GenshinAscension = Record<'silter' | 'fragment' | 'chunk' | 'gemstone', {
    id: string;
    name: string;
    sources: Array<string>;
    rarity: number;
}>;
export declare const resources: {
    artifacts: {
        type: 'artifacts';
        key: string;
        data: GenshinTypeEntity<{
            name: string;
            max_rarity: number;
            '1-piece_bonus'?: string;
            '2-piece_bonus'?: string;
            '4-piece_bonus'?: string;
        }>;
    } & {
        type: "artifacts";
        encode: true;
        key: string;
    };
    boss: {
        type: 'boss/weekly-boss';
        key: string;
        data: GenshinTypeEntity<{
            name: string;
            description: string;
            drops: Array<{
                name: string;
                rarity: number;
                source: string;
            }>;
            artifacts: Array<{
                name: string;
                max_rarity: number;
            }>;
        }>;
    } & {
        type: "boss/weekly-boss";
        encode: true;
        key: string;
    };
    characters: {
        type: 'characters';
        key: string;
        data: GenshinTypeEntity<{
            name: string;
            title: string;
            vision: GenshinVisionName;
            weapon: GenshinWeaponName;
            gender: 'Male' | 'Female';
            nation: GenshinNationName;
            affiliation: string;
            rarity: number;
            release: `${number}-${number}-${number}`;
            constellation: string;
            birthday: `${number}-${number}-${number}`;
            description: string;
            skillTalents: Array<GenshinSkillTalent>;
            passiveTalents: Array<GenshinPassiveTalent>;
            constellations: Array<GenshinConstellation>;
            vision_key: GenshinVisionKey;
            weapon_type: GenshinWeaponKey;
        }>;
    } & {
        type: "characters";
        encode: true;
        key: string;
    };
    foods: {
        type: 'consumables/food';
        key: string;
        data: {
            name: string;
            rarity: number;
            type: GenshinFoodType;
            effect: string;
            hasRecipe: boolean;
            description: string;
            proficiency: number;
            recipe?: Array<{
                item: string;
                quantity: number;
            }>;
        };
    } & {
        type: "consumables/food";
        encode: false;
        key: string;
    };
    potions: {
        type: 'consumables/potions';
        key: string;
        data: {
            name: string;
            effect: string;
            rarity: number;
            crafting: Array<{
                item: string;
                quantity: number;
            }>;
        };
    } & {
        type: "consumables/potions";
        encode: false;
        key: string;
    };
    domains: {
        type: 'domains';
        key: string;
        data: GenshinTypeEntity<{
            name: string;
            type: string;
            description: string;
            location: string;
            nation: GenshinNationName;
            requirements: Array<{
                level: number;
                adventureRank: number;
                recommendedlevel: number;
                leyLineDisorder: Array<string>;
            }>;
            recommendedElements: Array<GenshinVisionName>;
            rewards: Array<{
                day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
                details: Array<{
                    level: number;
                    adventureExpereince: number;
                    companionshipExperience: number;
                    mora: number;
                } & Partial<Record<'drops' | 'items', Array<{
                    name: string;
                    drop_min: number;
                    drop_max: number;
                }>>>>;
            }>;
        }>;
    } & {
        type: "domains";
        encode: true;
        key: string;
    };
    elements: {
        type: 'elements';
        key: Lowercase<GenshinVisionKey>;
        data: GenshinTypeEntity<{
            name: string;
            key: string;
            reactions: Array<{
                name: string;
                elements: Array<GenshinVisionName>;
                description: string;
            }>;
        }>;
    } & {
        type: "elements";
        encode: true;
        key: "anemo" | "cryo" | "electro" | "geo" | "hydro" | "pyro" | "dendro";
    };
    enemies: {
        type: 'enemies';
        key: string;
        data: GenshinTypeEntity<{
            name: string;
            title?: string;
            description?: string;
            regions: string;
            type: string;
            family: string;
            faction?: string;
            elements?: Array<GenshinVisionName>;
            element?: Array<GenshinVisionName>;
            drops?: Array<{
                name: string;
                rarity: number;
                'minimum-level': number;
            }>;
            artifacts?: Array<{
                name: string;
                set: string;
                rarity: string;
            }>;
            'elemental-description'?: Array<{
                element: GenshinVisionName;
                description: string;
            }>;
            'mora-gained'?: number;
        }>;
    } & {
        type: "enemies";
        encode: true;
        key: string;
    };
    boss_materials: {
        type: 'materials/boss-material';
        key: string;
        data: {
            name: string;
            source: string;
            characters: Array<string>;
        };
    } & {
        type: "materials/boss-material";
        encode: false;
        key: string;
    };
    character_ascension: {
        type: 'materials/character-ascension';
        key: 'anemo' | 'cryo' | 'dendro' | 'electro' | 'geo' | 'hydro' | 'pyro' | 'traveler';
        data: GenshinAscension;
    } & {
        type: "materials/character-ascension";
        encode: false;
        key: "anemo" | "cryo" | "electro" | "geo" | "hydro" | "pyro" | "dendro" | "traveler";
    };
    character_experience: {
        type: 'materials/character-experience';
        key: string;
        data: {
            items: Array<{
                id: string;
                name: string;
                experience: number;
                rarity: number;
            }>;
        };
    } & {
        type: "materials/character-experience";
        encode: false;
        key: string;
    };
    common_ascension: {
        type: 'materials/common-ascension';
        key: string;
        data: {
            weapons?: Array<string>;
            items: Array<{
                id: string;
                name: string;
                rarity: number;
            }>;
            characters?: Array<string>;
            sources: Array<string>;
        };
    } & {
        type: "materials/common-ascension";
        encode: false;
        key: string;
    };
    cooking_ingredients: {
        type: 'materials/cooking-ingredients';
        key: string;
        data: {
            name: string;
            description: string;
            sources: Array<string>;
        };
    } & {
        type: "materials/cooking-ingredients";
        encode: false;
        key: string;
    };
    local_specialties: {
        type: 'materials/local-specialties';
        key: string;
        data: {
            id: string;
            name: string;
            characters: Array<string>;
        };
    } & {
        type: "materials/local-specialties";
        encode: false;
        key: string;
    };
    talent_book: {
        type: 'materials/talent-book';
        key: 'freedom' | 'resistance' | 'ballad' | 'prosperity' | 'diligence' | 'gold' | 'transience' | 'elegance' | 'light';
        data: {
            characters: Array<string>;
            availability: Array<string>;
            source: string;
            items: Array<{
                id: string;
                name: string;
                rarity: number;
            }>;
        };
    } & {
        type: "materials/talent-book";
        encode: false;
        key: "freedom" | "resistance" | "ballad" | "prosperity" | "diligence" | "gold" | "transience" | "elegance" | "light";
    };
    talent_boss: {
        type: 'materials/talent-boss';
        key: string;
        data: {
            id: string;
            name: string;
            characters: Array<string>;
        };
    } & {
        type: "materials/talent-boss";
        encode: false;
        key: string;
    };
    weapon_ascension: {
        type: 'materials/weapon-ascension';
        key: GenshinWeaponAscensionType;
        data: {
            weapons: Array<string>;
            availability: Array<string>;
            source: string;
            items: Array<{
                id: string;
                name: string;
                rarity: number;
            }>;
        };
    } & {
        type: "materials/weapon-ascension";
        encode: false;
        key: GenshinWeaponAscensionType;
    };
    weapon_experience: {
        type: 'materials/weapon-experience';
        key: string;
        data: {
            items: Array<{
                id: string;
                name: string;
                experience: number;
                rarity: number;
                source: Array<string>;
            }>;
        };
    } & {
        type: "materials/weapon-experience";
        encode: false;
        key: string;
    };
    nations: {
        type: 'nations';
        key: 'inazuma' | 'mondstadt' | 'liyue';
        data: GenshinTypeEntity<{
            name: string;
            element: GenshinVisionName;
            archon: GenshinArchonName;
            controllingEntity: GenshinControlledEntityName;
        }>;
    } & {
        type: "nations";
        encode: true;
        key: "inazuma" | "mondstadt" | "liyue";
    };
    weapons: {
        type: 'weapons';
        key: string;
        data: GenshinTypeEntity<{
            name: string;
            type: GenshinWeaponName;
            rarity: number;
            baseAttack?: number;
            BaseAttack: number;
            subStat: GenshinWeaponSubStat;
            passiveName: string;
            passiveDesc: string;
            location: string;
            ascensionMaterial?: GenshinWeaponAscensionType;
        }>;
    } & {
        type: "weapons";
        encode: true;
        key: string;
    };
};
export {};
