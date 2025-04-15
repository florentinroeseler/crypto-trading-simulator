<script lang="ts">
    import { onMount } from 'svelte';
    
    let loading = false;
    let success = false;
    let error = '';
    
    async function generateTestData() {
      loading = true;
      error = '';
      success = false;
      
      try {
        const response = await fetch('/api/seed-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (response.ok) {
          success = true;
          setTimeout(() => {
            // Seite nach 1,5 Sekunden neu laden, um die neuen Daten anzuzeigen
            window.location.reload();
          }, 1500);
        } else {
          error = result.message || 'Ein Fehler ist aufgetreten';
        }
      } catch (err) {
        error = 'Netzwerkfehler beim Generieren der Testdaten';
        console.error(err);
      } finally {
        loading = false;
      }
    }
  </script>
  
  <div class="mb-6">
    <button
      on:click={generateTestData}
      disabled={loading}
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if loading}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generiere...
      {:else}
        Testdaten generieren
      {/if}
    </button>
    
    {#if success}
      <div class="mt-2 text-sm text-green-600">
        Testdaten erfolgreich erstellt! Seite wird neu geladen...
      </div>
    {/if}
    
    {#if error}
      <div class="mt-2 text-sm text-red-600">
        Fehler: {error}
      </div>
    {/if}
  </div>