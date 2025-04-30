// src/routes/api/users/search/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { like, ilike } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
  // Sicherstellen, dass der Benutzer angemeldet ist
  if (!locals.user) {
    return new Response('Nicht autorisiert', { status: 401 });
  }

  const searchTerm = url.searchParams.get('q');
  if (!searchTerm || searchTerm.length < 2) {
    return json([]);
  }

  try {
    const searchResults = await db
      .select({
        id: users.id,
        username: users.username,
        profileImageUrl: users.profileImageUrl
      })
      .from(users)
      .where(ilike(users.username, `%${searchTerm}%`))
      .limit(10);

    return json(searchResults);
  } catch (error) {
    console.error('Fehler bei der Benutzersuche:', error);
    return new Response('Interner Serverfehler', { status: 500 });
  }
};