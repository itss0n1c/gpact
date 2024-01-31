# gpact

<a href="https://discord.gg/8bt5dbycDM"><img src="https://img.shields.io/discord/977286501756968971?color=5865F2&logo=discord&logoColor=white" alt="Discord server" /></a>
<a href="https://www.npmjs.com/package/gpact"><img src="https://img.shields.io/npm/v/gpact?maxAge=3600" alt="npm version" /></a>
<a href="https://www.npmjs.com/package/gpact"><img src="https://img.shields.io/npm/dt/gpact.svg?maxAge=3600" alt="npm downloads" /></a>

### A simple library for interacting with the [fan-made Genshin Impact API](https://github.com/genshindev/api).

## Installation

```zsh
% yarn add gpact
```

## Usage
Set `GPACT_API_URL` to the current API URL, See [here](https://github.com/genshindev/api).

```ts
import { genshin } from 'gpact';

genshin.characters('amber').then(console.log); // Get character data
```
