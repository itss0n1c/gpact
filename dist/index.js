// lib/request.ts
async function request(path, queries = {}, options = {}, retry_count = 0) {
  if (!api_url()) {
    throw new Error("GPACT_API_URL is not set");
  }
  const signal = new AbortController;
  const timeout = setTimeout(() => signal.abort(), 5000);
  const url = new URL(path, api_url());
  for (const [key, value] of Object.entries(queries)) {
    url.searchParams.append(key, value.toString());
  }
  let res;
  try {
    res = await fetch(url.toString(), {
      ...options,
      signal: signal.signal
    });
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      if (retry_count < 3) {
        return request(path, queries, options, retry_count + 1);
      }
    }
    throw e;
  }
  clearTimeout(timeout);
  return res;
}
async function json(path, queries = {}, options = {}) {
  const res = await request(path, queries, options);
  return res.json();
}
var api_url = () => import.meta.env.GPACT_API_URL;

// lib/resources.ts
var create_resource = function(type, encode) {
  return {
    type,
    encode
  };
};
var resources = {
  artifacts: create_resource("artifacts", true),
  boss: create_resource("boss/weekly-boss", true),
  characters: create_resource("characters", true),
  foods: create_resource("consumables/food", false),
  potions: create_resource("consumables/potions", false),
  domains: create_resource("domains", true),
  elements: create_resource("elements", true),
  enemies: create_resource("enemies", true),
  boss_materials: create_resource("materials/boss-material", false),
  character_ascension: create_resource("materials/character-ascension", false),
  character_experience: create_resource("materials/character-experience", false),
  common_ascension: create_resource("materials/common-ascension", false),
  cooking_ingredients: create_resource("materials/cooking-ingredients", false),
  local_specialties: create_resource("materials/local-specialties", false),
  talent_book: create_resource("materials/talent-book", false),
  talent_boss: create_resource("materials/talent-boss", false),
  weapon_ascension: create_resource("materials/weapon-ascension", false),
  weapon_experience: create_resource("materials/weapon-experience", false),
  nations: create_resource("nations", true),
  weapons: create_resource("weapons", true)
};

// lib/index.ts
async function resolve_entity(type, id) {
  const entity = await json(join(type, id));
  return {
    id,
    ...entity
  };
}
var resolve_entities = function(type) {
  return async (ids) => Promise.all(ids.map((id) => resolve_entity(type, id)));
};
var create_endpoint = function(resource_type) {
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
      const ids = await json(join(type, id, "list"));
      return ids.map((i) => new URL(join(type, id, i), api_url()).toString());
    }
  };
  return methods;
};
var join = (...args) => args.join("/");
var artifacts = create_endpoint("artifacts");
var boss = create_endpoint("boss");
var characters = create_endpoint("characters");
var foods = create_endpoint("foods");
var potions = create_endpoint("potions");
var domains = create_endpoint("domains");
var elements = create_endpoint("elements");
var enemies = create_endpoint("enemies");
var boss_materials = create_endpoint("boss_materials");
var character_ascension = create_endpoint("character_ascension");
var character_experience = create_endpoint("character_experience");
var common_ascension = create_endpoint("common_ascension");
var cooking_ingredients = create_endpoint("cooking_ingredients");
var local_specialties = create_endpoint("local_specialties");
var talent_book = create_endpoint("talent_book");
var talent_boss = create_endpoint("talent_boss");
var weapon_ascension = create_endpoint("weapon_ascension");
var weapon_experience = create_endpoint("weapon_experience");
var nations = create_endpoint("nations");
var weapons = create_endpoint("weapons");
export {
  weapons,
  weapon_experience,
  weapon_ascension,
  talent_boss,
  talent_book,
  potions,
  nations,
  local_specialties,
  foods,
  enemies,
  elements,
  domains,
  cooking_ingredients,
  common_ascension,
  characters,
  character_experience,
  character_ascension,
  boss_materials,
  boss,
  artifacts,
  api_url
};
