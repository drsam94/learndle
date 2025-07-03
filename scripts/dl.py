#!/usr/bin/env python3
import requests # type: ignore
import json 
import collections

def main():
    num_pokemon = 1025

    version_groups = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(list)))

    for i in range(1, num_pokemon + 1):
        r = requests.get(f'https://pokeapi.co/api/v2/pokemon/{i}/')
        j = r.json()

        moves = j['moves']
        

        pkmn_name = j['name']
        for move in moves:
            for vgd in move["version_group_details"]:
                vgn = vgd["version_group"]["name"]
                pkmn = version_groups[vgn][pkmn_name]
                pkmn[vgd["move_learn_method"]["name"]].append(
                    (vgd["level_learned_at"], move["move"]["name"])
                )
                pkmn["id"] = i
        if i % 100 == 0:
            print(f"Successfully requested {i} pokemon...")
    with open('res/all_pokemon.json', "w+") as f:
        json.dump(version_groups, f)

if __name__ == "__main__":
    main()