// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Gib den angemeldeten Benutzer an alle Seiten weiter
  return {
    user: locals.user
  };
};