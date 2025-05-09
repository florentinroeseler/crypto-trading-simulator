<script lang="ts">
    import { goto } from '$app/navigation';

    // Zustandsvariablen für die Benutzersuchfunktion
    let searchTerm = '';            // Speichert den aktuellen Suchbegriff
    let searchResults = [];         // Speichert die Suchergebnisse als Array
    let loading = false;            // Zeigt an, ob gerade eine Suchanfrage läuft
    let debounceTimer: ReturnType<typeof setTimeout>;  // Timer für Debouncing

    /**
     * Sucht nach Benutzern basierend auf dem aktuellen Suchbegriff
     * Sendet eine API-Anfrage, wenn der Suchbegriff mindestens 2 Zeichen lang ist
     */
    async function searchUsers() {
        // Keine Suche durchführen, wenn der Suchbegriff zu kurz ist
        if (!searchTerm || searchTerm.length < 2) {
            searchResults = [];
            return;
        }

        loading = true;

        try {
            // API-Anfrage an den Backend-Endpunkt für die Benutzersuche
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
            if (response.ok) {
                searchResults = await response.json();
            } else {
                console.error('Fehler bei der Benutzersuche');
                searchResults = [];
            }
        } catch (error) {
            console.error('Fehler bei der Benutzersuche:', error);
            searchResults = [];
        } finally {
            loading = false;
        }
    }

    /**
     * Behandelt Eingabeänderungen im Suchfeld
     * Implementiert Debouncing, um zu viele API-Anfragen zu vermeiden
     */
    function handleSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchUsers();
        }, 300);  // 300ms Verzögerung vor dem Senden der Anfrage
    }

    /**
     * Navigiert zum Profil des ausgewählten Benutzers
     * Setzt nach der Navigation die Suchfelder zurück
     */
    function viewProfile(username) {
        goto(`/profile/${username}`);
        searchTerm = '';
        searchResults = [];
    }
</script>

<!-- Suchfeld-Container mit relativer Positionierung für das Dropdown -->
<div class="relative">
    <div class="relative">
        <!-- Eingabefeld für die Benutzersuche -->
        <input
            type="text"
            bind:value={searchTerm}
            on:input={handleSearch}
            placeholder="Benutzer suchen..."
            class="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <!-- Ladeindikator, der nur angezeigt wird, wenn eine Suche läuft -->
        {#if loading}
            <div class="absolute right-3 top-2.5">
                <svg
                    class="h-5 w-5 animate-spin text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                    ></circle>
                    <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                </svg>
            </div>
        {/if}
    </div>

    <!-- Dropdown mit Suchergebnissen, nur sichtbar wenn Ergebnisse vorhanden sind -->
    {#if searchResults.length > 0}
        <div class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg">
            <ul class="py-1">
                <!-- Iteration über alle gefundenen Benutzer -->
                {#each searchResults as user}
                    <li>
                        <button
                            on:click={() => viewProfile(user.username)}
                            class="flex w-full items-center px-4 py-2 text-left hover:bg-gray-100"
                        >
                            <!-- Profilbild des Benutzers mit Fallback-Avatar -->
                            <div class="flex-shrink-0">
                                <img
                                    src={user.profileImageUrl ||
                                        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                                    alt={user.username}
                                    class="h-8 w-8 rounded-full"
                                />
                            </div>
                            <!-- Benutzername -->
                            <div class="ml-3">
                                <p class="text-sm font-medium text-gray-900">{user.username}</p>
                            </div>
                        </button>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>