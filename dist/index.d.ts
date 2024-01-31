import { resources } from './resources.js';
interface GenshinEndpoint<T extends keyof typeof resources> {
    get all(): Promise<(typeof resources)[T]['encode'] extends true ? (typeof resources)[T]['data'][] : (typeof resources)[T]['data']>;
    get(id: (typeof resources)[T]['key']): Promise<(typeof resources)[T]['data']>;
    images(id: string): Promise<string[]>;
}
export declare const artifacts: GenshinEndpoint<"artifacts">;
export declare const boss: GenshinEndpoint<"boss">;
export declare const characters: GenshinEndpoint<"characters">;
export declare const foods: GenshinEndpoint<"foods">;
export declare const potions: GenshinEndpoint<"potions">;
export declare const domains: GenshinEndpoint<"domains">;
export declare const elements: GenshinEndpoint<"elements">;
export declare const enemies: GenshinEndpoint<"enemies">;
export declare const boss_materials: GenshinEndpoint<"boss_materials">;
export declare const character_ascension: GenshinEndpoint<"character_ascension">;
export declare const character_experience: GenshinEndpoint<"character_experience">;
export declare const common_ascension: GenshinEndpoint<"common_ascension">;
export declare const cooking_ingredients: GenshinEndpoint<"cooking_ingredients">;
export declare const local_specialties: GenshinEndpoint<"local_specialties">;
export declare const talent_book: GenshinEndpoint<"talent_book">;
export declare const talent_boss: GenshinEndpoint<"talent_boss">;
export declare const weapon_ascension: GenshinEndpoint<"weapon_ascension">;
export declare const weapon_experience: GenshinEndpoint<"weapon_experience">;
export declare const nations: GenshinEndpoint<"nations">;
export declare const weapons: GenshinEndpoint<"weapons">;
export {};
