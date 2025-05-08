<!-- src/routes/profile/edit/+page.svelte (aktualisiert) -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    
    export let data: PageData;
    export let form;
    
    let bio = data.profile.bio || '';
    let profileImageUrl = data.profile.profileImageUrl || '';
    let isPortfolioPublic = data.profile.isPortfolioPublic;
    
    // Standardbild
    const defaultProfileImage = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    $: previewImageUrl = profileImageUrl || defaultProfileImage;

    let isUploading = false;
    let uploadError = '';
    let tempProfileImageUrl = ''; // Temporäre URL vor dem Speichern
    
    // Profilbild-Upload Funktionalität
    let uploadInput: HTMLInputElement;
    
    // Funktion zum Aktualisieren des Profilbilds in der gesamten App
    // Diese Funktion wird nur nach erfolgreicher Formularübermittlung aufgerufen
    function updateProfileImageInApp(imageUrl) {
        if (browser && data.profile.id) {
            // Speichere das Bild im lokalen Speicher mit benutzer-spezifischem Schlüssel
            const storageKey = `userProfileImage_${data.profile.id}`;
            localStorage.setItem(storageKey, imageUrl);
            
            // Löse ein benutzerdefiniertes Ereignis aus mit Benutzer-ID
            window.dispatchEvent(new CustomEvent('profileImageUpdated', {
                detail: { 
                    profileImageUrl: imageUrl,
                    userId: data.profile.id
                }
            }));
        }
    }
    
    // Funktion zum Weiterleiten nach erfolgreicher Aktualisierung
    function handleSuccess() {
        // Aktualisiere das Profilbild in der App ERST NACH erfolgreicher Formularübermittlung
        updateProfileImageInApp(profileImageUrl);
        
        // Navigiere zur Profilseite mit kurzer Verzögerung
        setTimeout(() => {
            goto(`/profile/${data.profile.username}`);
        }, 1000);
    }
    
    async function uploadImage(file: File) {
        isUploading = true;
        uploadError = '';
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Fehler beim Hochladen des Bildes');
            }
            
            const result = await response.json();
            
            if (result.success && result.url) {
                profileImageUrl = result.url;
                tempProfileImageUrl = result.url; // Speichere die URL nur temporär
                // NICHT mehr hier aktualisieren: updateProfileImageInApp(result.url);
            } else {
                throw new Error(result.message || 'Unbekannter Fehler beim Hochladen');
            }
        } catch (error) {
            console.error('Fehler beim Hochladen:', error);
            uploadError = error.message || 'Fehler beim Hochladen des Bildes';
        } finally {
            isUploading = false;
        }
    }
    
    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            
            // Prüfe Dateityp und -größe
            if (!file.type.startsWith('image/')) {
                uploadError = 'Bitte wähle eine Bilddatei aus.';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5 MB Limit
                uploadError = 'Das Bild darf nicht größer als 5 MB sein.';
                return;
            }
            
            uploadImage(file);
        }
    }
</script>
  
  <svelte:head>
    <title>Profil bearbeiten | DHBWallet</title>
  </svelte:head>
  
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-blue-600 px-6 py-4">
          <h1 class="text-xl font-bold text-white">Profil bearbeiten</h1>
        </div>
        
        {#if form?.success}
          <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 mx-6 mt-6">
            <p>Profil erfolgreich aktualisiert!</p>
          </div>
        {/if}
        
        {#if form?.error}
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-6 mt-6">
            <p>{form.error}</p>
          </div>
        {/if}
        
        <form 
            method="POST" 
            action="/profile/edit?/updateProfile" 
            use:enhance={({ form }) => {
                return async ({ result }) => {
                if (result.type === 'success') {
                    handleSuccess();
                }
                };
            }}
            class="p-6"
        >
          <!-- Profilbild-Vorschau -->
            <!-- Ersetzt das Profilbild-Input-Feld mit dieser verbesserten Version -->
            <div class="mb-6">
                <label for="profile-image" class="block text-sm font-medium text-gray-700 mb-2">
                Profilbild
                </label>
                
                <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                    <div class="relative">
                    <img 
                        src={profileImageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                        alt="Profilbild-Vorschau" 
                        class="h-32 w-32 rounded-full object-cover"
                    />
                    {#if isUploading}
                        <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <svg class="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        </div>
                    {/if}
                    </div>
                </div>
                
                <div class="flex-1">
                    <input type="hidden" name="profileImageUrl" bind:value={profileImageUrl} />
                    
                    <div class="mb-2">
                    <button 
                        type="button"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        on:click={() => uploadInput.click()}
                    >
                        Bild auswählen
                    </button>
                    <input 
                        bind:this={uploadInput}
                        type="file" 
                        id="profile-image" 
                        accept="image/*"
                        class="hidden" 
                        on:change={handleFileSelect}
                    />
                    </div>
                    
                    {#if uploadError}
                    <p class="text-red-600 text-sm mt-1">{uploadError}</p>
                    {/if}
                    
                    <p class="text-sm text-gray-500">
                    Empfohlene Größe: 500 x 500 Pixel (maximal 5 MB)
                    </p>
                </div>
                </div>
            </div>
          
          <!-- Bio / Über mich -->
          <div class="mb-6">
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
              Über mich
            </label>
            <textarea 
              id="bio" 
              name="bio" 
              bind:value={bio}
              rows="4" 
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Erzähle etwas über dich und deine Trading-Strategie..."
            ></textarea>
          </div>
          
          <!-- Portfolio-Sichtbarkeit -->
          <div class="mb-6">
            <div class="flex items-center">
              <input 
                id="portfolio-public" 
                name="isPortfolioPublic" 
                type="checkbox" 
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                checked={isPortfolioPublic}
                value="true"
              />
              <label for="portfolio-public" class="ml-2 block text-sm text-gray-700">
                Mein Portfolio öffentlich anzeigen
              </label>
            </div>
          </div>
          
          <!-- Buttons -->
          <div class="flex justify-end space-x-4">
            <a 
              href="/profile/{data.profile.username}" 
              class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Abbrechen
            </a>
            <button 
              type="submit" 
              class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>