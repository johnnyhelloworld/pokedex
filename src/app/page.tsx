'use client';

import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Pokemon, PokemonApiResponse, PokemonType } from '@/types/pokemon';
import Link from 'next/link';

const API_URL = 'https://nestjs-pokedex-api.vercel.app/pokemons';

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [allTypes, setAllTypes] = useState<PokemonType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await axios.get<PokemonType[]>('https://nestjs-pokedex-api.vercel.app/types');
        setAllTypes(response.data);
      } catch (error) {
        console.error('Error fetching types:', error);
        setError('Failed to load Pokémon types');
      }
    };
  
    fetchTypes();
  }, []);  

  useEffect(() => {
    fetchPokemons(0);
  }, [searchTerm, selectedTypes, limit]);
  
  const fetchPokemons = async (currentOffset: number) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const params = {
        page: Math.floor(currentOffset / limit) + 1,
        perPage: limit,
        name: searchTerm || undefined,
        types: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
      };
  
      const response = await axios.get<PokemonApiResponse>(API_URL, { params });
      const newPokemons = response.data;
  
      setPokemons(prev => 
        currentOffset === 0 
          ? newPokemons 
          : [...prev, ...newPokemons]
      );
      setOffset(currentOffset + newPokemons.length);
      setHasMore(newPokemons.length === limit);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching pokemons:', axiosError);
      setError(axiosError.message || 'Failed to load Pokémon');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };  

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Pokédex</h1>
        
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search Pokémon by name..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                aria-expanded={isFilterOpen}
                aria-controls="filter-panel"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </button>
              
              {isFilterOpen && (
                <div 
                  id="filter-panel"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 p-4"
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items per page:
                    </label>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-full border rounded-lg p-2"
                      disabled={isLoading}
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by type:
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {allTypes.map((type) => (
                        <div key={type.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`type-${type.id}`}
                            checked={selectedTypes.includes(type.id)}
                            onChange={() => handleTypeToggle(type.id)}
                            className="h-4 w-4 text-blue-600 rounded"
                            disabled={isLoading}
                          />
                          <label htmlFor={`type-${type.id}`} className="ml-2 text-sm text-gray-700 capitalize">
                            {type.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <InfiniteScroll
          dataLength={pokemons.length}
          next={() => fetchPokemons(offset)}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 my-8">
              {pokemons.length === 0 ? 'No Pokémon found' : 'You have seen all Pokémon!'}
            </p>
          }
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {pokemons.map((pokemon) => (
            <Link
              key={pokemon.id}
              href={`/pokemon/${pokemon.id}`}
              className="block w-full text-black"
            >
              <PokemonCard pokemon={pokemon} />
            </Link>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <span className="text-gray-500 text-sm">#{pokemon.id.toString().padStart(3, '0')}</span>
        </div>
        
        <div className="flex justify-center my-4">
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="h-32 w-32 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-pokemon.png';
            }}
          />
        </div>
        
        <h2 className="text-xl font-semibold text-center capitalize">{pokemon.name}</h2>
        
        <div className="flex justify-center gap-2 mt-3">
        {pokemon.types.map((typeObj) => (
          <span
            key={typeObj.name}
            className={`px-2 py-1 text-xs rounded-full capitalize ${getTypeColorClass(typeObj.name)}`}
          >
            {typeObj.name}
          </span>
        ))}
        </div>
      </div>
    </div>
  );
}

function getTypeColorClass(type: string): string {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400 text-white',
    feu: 'bg-red-500 text-white',
    eau: 'bg-blue-500 text-white',
    électrik: 'bg-yellow-400 text-gray-800',
    plante: 'bg-green-500 text-white',
    glace: 'bg-blue-200 text-gray-800',
    combat: 'bg-red-700 text-white',
    poison: 'bg-purple-500 text-white',
    sol: 'bg-yellow-600 text-white',
    vol: 'bg-indigo-300 text-gray-800',
    psy: 'bg-pink-500 text-white',
    insecte: 'bg-green-400 text-gray-800',
    roche: 'bg-yellow-700 text-white',
    spectre: 'bg-purple-700 text-white',
    dragon: 'bg-indigo-600 text-white',
    dark: 'bg-gray-800 text-white',
    acier: 'bg-gray-500 text-white',
    fée: 'bg-pink-300 text-gray-800',
  };
  
  const colorClass = typeColors[type.toLowerCase()];
  if (!colorClass) {
    console.error(`Type color not found for: ${type}`);
    return 'bg-gray-200 text-gray-800';
  }
  
  return colorClass;
}