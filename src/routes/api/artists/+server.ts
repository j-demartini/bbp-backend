import { getArtists, addArtist } from '$lib/server/db'
import { json } from '@sveltejs/kit'

export function GET({ url })
{
    const searchTerm = url.searchParams.get('search') ?? '';
    const artists = getArtists(searchTerm);
    return json(artists);
}