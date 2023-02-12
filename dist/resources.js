function create_resource(type, encode) {
    return {
        type,
        encode
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
    weapons: create_resource('weapons', true)
};
