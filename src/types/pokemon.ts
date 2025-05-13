export interface Pokemon {
    id: number;
    name: string;
    image: string;
    types: string[];
}

export type PokemonType = {
    id: number;
    name: string;
    image: string;
};

export interface Stat {
    name: string;
    value: number;
}

export interface Evolution {
    id: number;
    name: string;
    image: string;
}

export interface PokemonApiResponse extends Array<Pokemon> {}