<!-- src/lib/components/AdminAssets.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    export let isAdmin = false;
    
    let assets = [];
    let isLoading = true;
    let assetToRemove = null;
    let removeStatus = '';
    let showRemoveModal = false;
    let compensationAmount = 0;
    
    // Formatierungsfunktion für Währungen
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };
    
    // Lade Assets
    async function loadAssets() {
      try {
        isLoading = true;
        const response = await fetch('/api/assets');
        const data = await response.json();
        
        if (data.success) {
          assets = data.assets;
        } else {
          console.error('Fehler beim Laden der Assets:', data.message);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Assets:', error);
      } finally {
        isLoading = false;
      }
    }
    
    // Zeige den Modal-Dialog zum Entfernen eines Assets
    function showRemoveAssetModal(asset) {
      assetToRemove = asset;
      compensationAmount = asset.currentPrice || 0; // Standardwert: aktueller Preis
      showRemoveModal = true;
    }
    
    // Schließe den Modal-Dialog
    function closeRemoveModal() {
      showRemoveModal = false;
      assetToRemove = null;
    }
    
    // Entferne ein Asset
    async function removeAsset() {
      if (!assetToRemove) return;
      
      try {
        removeStatus = `Entferne ${assetToRemove.symbol}...`;
        
        const response = await fetch('/api/admin/remove-asset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            symbol: assetToRemove.symbol,
            compensationAmount: compensationAmount
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          removeStatus = `${assetToRemove.symbol} erfolgreich entfernt. ${data.affectedPortfolios} Portfolios betroffen.`;
          // Nach erfolgreichem Entfernen Assets neu laden
          await loadAssets();
          setTimeout(() => {
            closeRemoveModal();
            removeStatus = '';
          }, 3000);
        } else {
          removeStatus = `Fehler: ${data.message || 'Unbekannter Fehler'}`;
        }
      } catch (error) {
        removeStatus = `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
      }
    }
    
    // Beim Mounten der Komponente Assets laden
    onMount(() => {
      if (isAdmin) {
        loadAssets();
      }
    });
  </script>
  
  {#if isAdmin}
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Asset-Verwaltung</h2>
      
      {#if isLoading}
        <div class="text-center py-4">
          <p>Assets werden geladen...</p>
        </div>
      {:else if assets.length === 0}
        <div class="text-center py-4">
          <p>Keine Assets gefunden.</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktueller Preis</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each assets as asset}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      {#if asset.imageUrl}
                        <img src={asset.imageUrl} alt={asset.symbol} class="h-6 w-6 rounded-full mr-2" />
                      {:else}
                        <div class="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <span class="text-xs font-medium">{asset.symbol.substring(0, 2)}</span>
                        </div>
                      {/if}
                      <span class="font-medium">{asset.symbol}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(asset.currentPrice)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.apiSupported ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {asset.apiSupported ? 'API unterstützt' : 'Nicht unterstützt'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <!-- "Entfernen"-Button für alle Assets anzeigen -->
                    <button 
                      class="text-red-600 hover:text-red-900"
                      on:click={() => showRemoveAssetModal(asset)}
                    >
                      Entfernen
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
    
    <!-- Modal zum Entfernen eines Assets -->
    {#if showRemoveModal && assetToRemove}
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Asset entfernen</h3>
          
          <p class="mb-4">
            Bist du sicher, dass du <span class="font-bold">{assetToRemove.name} ({assetToRemove.symbol})</span> entfernen möchtest?
          </p>
          
          <p class="mb-4 text-sm text-gray-500">
            Diese Aktion kann nicht rückgängig gemacht werden. Alle Portfolios, die dieses Asset enthalten, werden angepasst und die Benutzer erhalten eine Entschädigung.
          </p>
          
          <div class="mb-4">
            <label for="compensation" class="block text-sm font-medium text-gray-700 mb-1">
              Entschädigungsbetrag pro Einheit
            </label>
            <input 
              type="number" 
              id="compensation" 
              bind:value={compensationAmount} 
              step="0.01" 
              min="0" 
              class="w-full p-2 border border-gray-300 rounded" 
            />
            <p class="mt-1 text-xs text-gray-500">
              Benutzer erhalten diesen Betrag für jede Einheit des Assets in ihrem Portfolio.
            </p>
          </div>
          
          {#if removeStatus}
            <div class="mb-4 p-3 rounded text-sm" class:bg-green-100={removeStatus.includes('erfolgreich')} class:text-green-800={removeStatus.includes('erfolgreich')} class:bg-red-100={removeStatus.includes('Fehler')} class:text-red-800={removeStatus.includes('Fehler')}>
              {removeStatus}
            </div>
          {/if}
          
          <div class="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              on:click={closeRemoveModal}
            >
              Abbrechen
            </button>
            <button 
              type="button" 
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              on:click={removeAsset}
            >
              Asset entfernen
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}