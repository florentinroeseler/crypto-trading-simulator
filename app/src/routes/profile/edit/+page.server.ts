// src/routes/profile/edit/+page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  try {
    // Hol die aktuellen Profildaten des Benutzers
    const userData = await db.query.users.findFirst({
      where: eq(users.id, locals.user.id),
      columns: {
        username: true,
        email: true,
        profileImageUrl: true,
        bio: true,
        isPortfolioPublic: true
      }
    });

    return {
      profile: userData || {
        username: locals.user.username,
        email: locals.user.email,
        profileImageUrl: null,
        bio: '',
        isPortfolioPublic: true
      }
    };
  } catch (error) {
    console.error('Fehler beim Laden des Benutzerprofils:', error);
    return {
      profile: {
        username: locals.user.username,
        email: locals.user.email,
        profileImageUrl: null,
        bio: '',
        isPortfolioPublic: true
      }
    };
  }
};

export const actions = {
  updateProfile: async ({ request, locals }) => {
    // Prüfe, ob der Benutzer angemeldet ist
    if (!locals.user) {
      throw redirect(302, '/login');
    }

    const formData = await request.formData();
    const bio = formData.get('bio')?.toString() || '';
    const profileImageUrl = formData.get('profileImageUrl')?.toString() || null;
    const isPortfolioPublic = formData.has('isPortfolioPublic');

    try {
      // Profilbild-URL und Bio aktualisieren
      await db
        .update(users)
        .set({
          profileImageUrl,
          bio,
          isPortfolioPublic,
          updatedAt: new Date()
        })
        .where(eq(users.id, locals.user.id));

      return { success: true };
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      return fail(500, {
        success: false,
        error: 'Fehler beim Aktualisieren des Profils'
      });
    }
  }
};