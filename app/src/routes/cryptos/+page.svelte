<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    // Formatieren des Preises mit Tausendertrennzeichen und 2 Dezimalstellen
    const formatPrice = (price: number): string => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    };
  </script>
  
  <div class="py-12 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
          Kryptowährungen
        </h1>
        <p class="max-w-2xl mx-auto text-xl text-gray-500">
          Aktuelle Kurse und Informationen zu verschiedenen Kryptowährungen.
        </p>
      </div>
  
      <div class="mt-10">
        {#if data.cryptos && data.cryptos.length > 0}
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              {#each data.cryptos as crypto}
                <li>
                  <div class="px-4 py-5 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                    <div class="flex items-center">
                      {#if crypto.imageUrl}
                        <div class="flex-shrink-0 h-12 w-12 mr-4">
                          <img src={crypto.imageUrl} alt={crypto.name} class="h-12 w-12" />
                        </div>
                      {/if}
                      <div>
                        <h3 class="text-lg font-medium text-gray-900 flex items-center">
                          {crypto.name}
                          <span class="ml-2 text-sm font-normal text-gray-500">{crypto.symbol}</span>
                        </h3>
                        <p class="text-sm text-gray-500 capitalize">{crypto.type}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-lg font-semibold text-gray-900">
                        {formatPrice(crypto.currentPrice)}
                      </p>
                      <p class="text-xs text-gray-500">
                        Letzte Aktualisierung: {new Date(crypto.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {:else}
          <div class="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p class="text-gray-500">Keine Kryptowährungen gefunden.</p>
            <p class="mt-2 text-sm text-gray-400">Stelle sicher, dass du die Seeding-Daten eingefügt hast.</p>
            <button
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              on:click={() => window.location.reload()}
            >
              Aktualisieren
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>