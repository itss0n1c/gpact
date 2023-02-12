/* eslint-disable no-unused-vars */
import { join } from 'path';
import { api_url, json } from './request.js';
import { resources } from './resources.js';
async function resolve_entity(type, id) {
    const entity = await json(join(type, id));
    return {
        id,
        ...entity
    };
}
function resolve_entities(type) {
    return async (ids) => Promise.all(ids.map((id) => resolve_entity(type, id)));
}
function create_endpoint(resource_type) {
    const { type: _type, encode } = resources[resource_type];
    const type = encode ? encodeURIComponent(_type) : _type;
    const methods = {
        get all() {
            if (!encode)
                return json(type);
            return json(type).then(resolve_entities(type));
        },
        get: async (id) => {
            if (!encode) {
                const all = await methods.all;
                const find = all[id];
                if (!find) {
                    throw new Error(`Could not find ${id} in ${type}`);
                }
                return find;
            }
            return resolve_entity(type, id);
        },
        images: async (id) => {
            const ids = await json(join(type, id, 'list'));
            return ids.map((i) => new URL(join(type, id, i), api_url).toString());
        }
    };
    return methods;
}
export const artifacts = create_endpoint('artifacts');
export const boss = create_endpoint('boss');
export const characters = create_endpoint('characters');
export const foods = create_endpoint('foods');
export const potions = create_endpoint('potions');
export const domains = create_endpoint('domains');
export const elements = create_endpoint('elements');
export const enemies = create_endpoint('enemies');
export const boss_materials = create_endpoint('boss_materials');
export const character_ascension = create_endpoint('character_ascension');
export const character_experience = create_endpoint('character_experience');
export const common_ascension = create_endpoint('common_ascension');
export const cooking_ingredients = create_endpoint('cooking_ingredients');
export const local_specialties = create_endpoint('local_specialties');
export const talent_book = create_endpoint('talent_book');
export const talent_boss = create_endpoint('talent_boss');
export const weapon_ascension = create_endpoint('weapon_ascension');
export const weapon_experience = create_endpoint('weapon_experience');
export const nations = create_endpoint('nations');
export const weapons = create_endpoint('weapons');
