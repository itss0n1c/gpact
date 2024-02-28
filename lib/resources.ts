type GenshinTypeEntity<T> = {
	id: string;
} & {
	[key in keyof T]: T[key];
};

type GenshinVisionName = 'Anemo' | 'Cryo' | 'Electro' | 'Geo' | 'Hydro' | 'Pyro' | 'Dendro';
type GenshinVisionKey = 'ANEMO' | 'CRYO' | 'ELECTRO' | 'GEO' | 'HYDRO' | 'PYRO' | 'DENDRO';
type GenshinWeaponName = 'Claymore' | 'Polearm' | 'Sword' | 'Bow' | 'Catalyst';
type GenshinWeaponKey = 'CLAYMORE' | 'POLEARM' | 'SWORD' | 'BOW' | 'CATALYST';
type GenshinNationName =
	| 'Mondstadt'
	| 'Unknown'
	| 'Inazuma'
	| 'Liyue'
	| 'Sumeru'
	| 'Snezhnaya'
	| 'Outlander'
	| 'Fontaine';
type GenshinArchonName = 'Baal' | 'Morax' | 'Barbatos';
type GenshinControlledEntityName = 'Inazuma Bakufu' | 'Liyue Qixing' | 'Knights of Favonius';
type GenshinWeaponSubStat =
	| 'ATK'
	| 'Attack'
	| 'Elemental Mastery'
	| '-'
	| 'Physical DMG Bonus'
	| 'HP'
	| 'CRIT DMG'
	| 'DEF'
	| 'CRIT Rate'
	| 'Energy Recharge';
type GenshinWeaponAscensionType =
	| 'distantant-sea'
	| 'dandelion'
	| 'aerosiderite'
	| 'decarabian'
	| 'guyun'
	| 'elixir'
	| 'boreal'
	| 'mask'
	| 'narukami';
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

export type GenshinAscension = Record<
	'silter' | 'fragment' | 'chunk' | 'gemstone',
	{
		id: string;
		name: string;
		sources: Array<string>;
		rarity: number;
	}
>;

interface Resources {
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
	};
	'boss/weekly-boss': {
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
	};
	'consumables/food': {
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
	};
	'consumables/potions': {
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
				details: Array<
					{
						level: number;
						adventureExpereince: number;
						companionshipExperience: number;
						mora: number;
					} & Partial<
						Record<
							'drops' | 'items',
							Array<{
								name: string;
								drop_min: number;
								drop_max: number;
							}>
						>
					>
				>;
			}>;
		}>;
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
	};
	'materials/boss-material': {
		type: 'materials/boss-material';
		key: string;
		data: {
			name: string;
			source: string;
			characters: Array<string>;
		};
	};
	'materials/character-ascension': {
		type: 'materials/character-ascension';
		key: 'anemo' | 'cryo' | 'dendro' | 'electro' | 'geo' | 'hydro' | 'pyro' | 'traveler';
		data: GenshinAscension;
	};
	'materials/character-experience': {
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
	};
	'materials/common-ascension': {
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
	};
	'materials/cooking-ingredients': {
		type: 'materials/cooking-ingredients';
		key: string;
		data: {
			name: string;
			description: string;
			sources: Array<string>;
		};
	};
	'materials/local-specialties': {
		type: 'materials/local-specialties';
		key: string;
		data: {
			id: string;
			name: string;
			characters: Array<string>;
		};
	};
	'materials/talent-book': {
		type: 'materials/talent-book';
		key:
			| 'freedom'
			| 'resistance'
			| 'ballad'
			| 'prosperity'
			| 'diligence'
			| 'gold'
			| 'transience'
			| 'elegance'
			| 'light';
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
	};
	'materials/talent-boss': {
		type: 'materials/talent-boss';
		key: string;
		data: {
			id: string;
			name: string;
			characters: Array<string>;
		};
	};
	'materials/weapon-ascension': {
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
	};
	'materials/weapon-experience': {
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
	};
	weapons: {
		type: 'weapons';
		key: string;
		data: GenshinTypeEntity<{
			name: string;
			type: GenshinWeaponName;
			rarity: number;
			baseAttack?: number;
			BaseAttack: number; // whoever made this api clearly doesn't know how to name things
			subStat: GenshinWeaponSubStat;
			passiveName: string;
			passiveDesc: string;
			location: string;
			ascensionMaterial?: GenshinWeaponAscensionType;
		}>;
	};
}

function create_resource<T extends keyof Resources, Encode extends boolean>(type: T, encode: Encode) {
	return {
		type,
		encode,
	} as Resources[T] & {
		type: T;
		encode: typeof encode;
		key: Resources[T]['key'];
	};
}

export const resources = {
	artifacts: create_resource('artifacts', true),
	boss: create_resource('boss/weekly-boss', true),
	characters: create_resource('characters', true),
	foods: create_resource('consumables/food', false),
	potions: create_resource('consumables/potions', false),
	domains: create_resource('domains', true),
	elements: create_resource('elements', true),
	enemies: create_resource('enemies', true),
	boss_materials: create_resource('materials/boss-material', false),
	character_ascension: create_resource('materials/character-ascension', false),
	character_experience: create_resource('materials/character-experience', false),
	common_ascension: create_resource('materials/common-ascension', false),
	cooking_ingredients: create_resource('materials/cooking-ingredients', false),
	local_specialties: create_resource('materials/local-specialties', false),
	talent_book: create_resource('materials/talent-book', false),
	talent_boss: create_resource('materials/talent-boss', false),
	weapon_ascension: create_resource('materials/weapon-ascension', false),
	weapon_experience: create_resource('materials/weapon-experience', false),
	nations: create_resource('nations', true),
	weapons: create_resource('weapons', true),
};
