import PokemonDetails from '@/components/PokemonDetails';

export default function PokemonPage({ params }: { params: { id: string } }) {
    return <PokemonDetails id={params.id} />;
}