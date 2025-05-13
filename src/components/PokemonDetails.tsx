'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Pokemon } from '@/types/pokemon';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PokemonDetails({ id }: { id: string }) {
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            try {
                const response = await axios.get<Pokemon>(`https://nestjs-pokedex-api.vercel.app/pokemons/${id}`);
                setPokemon(response.data);
            } catch (err) {
                setError('Failed to load Pokémon details');
                console.error(err);
            }
        };

        if (id) fetchPokemonDetails();
    }, [id]);

    const handleBack = () => {
        router.push('/');
    };

    if (error) {
        return (
            <div className="text-center">
                <p>{error}</p>
                <button onClick={handleBack} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Retour à la liste
                </button>
            </div>
        );
    }

    if (!pokemon) return <div className="text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-6"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Retour à la liste
                </button>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-4 capitalize text-black">{pokemon.name}</h1>
                    <img
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="mx-auto mb-4 w-64 h-64 object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-pokemon.png';
                        }}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-black">Stats</h2>
                            <ul className="space-y-2">
                                {Object.entries(pokemon.stats).map(([key, value]) => (
                                    <li key={key} className="flex justify-between text-black">
                                        <span className="font-medium capitalize">{key}:</span>
                                        <span>{value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-2 text-black">Évolutions</h2>
                            {pokemon.evolutions.length === 0 ? (
                                <p>Aucune évolution disponible</p>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    {pokemon.evolutions.map((evo) => (
                                        <div key={evo.pokedexId} className="text-center">
                                            <img
                                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.pokedexId}.png`}
                                                alt={evo.name}
                                                className="w-20 h-20 object-contain mx-auto"
                                            />
                                            <p className="capitalize text-black">{evo.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}