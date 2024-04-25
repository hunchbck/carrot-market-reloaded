"use server";

import "server-only";

export async function fetchFromAPI() {
    const data = await fetch(
        "https://nomad-movies.nomadcoders.workers.dev/movies"
    );
}