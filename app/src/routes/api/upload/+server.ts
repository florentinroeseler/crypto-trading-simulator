import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Erstelle Speicherpfad für Uploads
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../../static/uploads');

// Stelle sicher, dass der Upload-Ordner existiert
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const POST: RequestHandler = async ({ request, locals }) => {
  // Prüfe, ob der Benutzer angemeldet ist
  if (!locals.user) {
    return json({ success: false, message: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return json({ success: false, message: 'Kein Bild gefunden' }, { status: 400 });
    }

    // Validierung der Datei
    if (!imageFile.type.startsWith('image/')) {
      return json({ success: false, message: 'Die Datei ist kein Bild' }, { status: 400 });
    }

    if (imageFile.size > 5 * 1024 * 1024) { // 5 MB Limit
      return json({ success: false, message: 'Das Bild ist zu groß (max. 5 MB)' }, { status: 400 });
    }

    // Generiere eindeutigen Dateinamen
    const fileExtension = imageFile.name.split('.').pop();
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${randomName}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Speichere die Datei
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Rückgabe der URL zum Bild
    const imageUrl = `/uploads/${fileName}`;
    return json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Fehler beim Hochladen des Bildes:', error);
    return json({ success: false, message: 'Fehler beim Hochladen des Bildes' }, { status: 500 });
  }
};