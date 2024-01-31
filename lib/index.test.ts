import { expect, test } from "bun:test";
import * as genshin from "./index.js";

test("get character named amber", async () => {
	const amber = await genshin.characters.get("amber");
	console.log(amber);
	expect(amber.name).toBe("Amber");
});
