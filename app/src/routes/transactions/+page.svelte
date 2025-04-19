<!-- src/routes/transactions/+page.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    // Reaktive Eigenschaften für Filter und Sortierung
    let currentPage = data.pagination.currentPage;
    let limit = data.pagination.limit;
    let typeFilter = data.filters.type;
    let assetFilter = data.filters.asset;
    let sortBy = data.sorting.sortBy;
    let sortDirection = data.sorting.sortDirection;
    
    // Format helpers
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };
    
    const formatDateTime = (dateInput: string | Date): string => {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    };
    
    // Funktion zum Ändern der Sortierung
    function changeSort(column: string) {
      if (sortBy === column) {
        // Wenn bereits nach dieser Spalte sortiert, dann Richtung ändern
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Sonst nach dieser Spalte sortieren (Standard: absteigend)
        sortBy = column;
        sortDirection = 'desc';
      }
      applyFilters();
    }
    
    // Funktion zum Anwenden der Filter und Sortierung
    function applyFilters() {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      
      if (typeFilter !== 'all') {
        params.set('type', typeFilter);
      }
      
      if (assetFilter) {
        params.set('asset', assetFilter);
      }
      
      params.set('sortBy', sortBy);
      params.set('sortDirection', sortDirection);
      
      // Navigation zur gefilterten URL
      goto(`/transactions?${params.toString()}`);
    }
    
    // Funktion zum Zurücksetzen der Filter
    function resetFilters() {
      currentPage = 1;
      typeFilter = 'all';
      assetFilter = '';
      sortBy = 'timestamp';
      sortDirection = 'desc';
      applyFilters();
    }
    
    // Seitenwechsel-Funktion
    function goToPage(pageNum: number) {
      if (pageNum >= 1 && pageNum <= data.pagination.totalPages) {
        currentPage = pageNum;
        applyFilters();
      }
    }
    
    // Hilfsfunktion für die Paginierungs-Anzeige
    function getPageNumbers(): number[] {
      const totalPages = data.pagination.totalPages;
      const current = data.pagination.currentPage;
      
      if (totalPages <= 5) {
        // Wenn weniger als 5 Seiten, alle anzeigen
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      // Ansonsten zeige aktuell, erste, letzte und Seiten um aktuell
      const pages = [1];
      
      if (current > 3) {
        pages.push(-1); // Platzhalter für "..."
      }
      
      // Bereich um die aktuelle Seite
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < totalPages - 2) {
        pages.push(-1); // Platzhalter für "..."
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
      
      return pages;
    }
  </script>
  
  <svelte:head>
    <title>Transaktionsverlauf | Crypto Trading Simulator</title>
  </svelte:head>
  
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Transaktionsverlauf</h1>
        <a href="/dashboard" class="text-blue-600 hover:text-blue-800">
          &larr; Zurück zum Dashboard
        </a>
      </div>
      
      <!-- Transaktionsstatistik -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Transaktionsübersicht</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-green-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-green-800">Kaufvolumen</h3>
            <p class="text-2xl font-bold text-green-700 mt-1">{formatCurrency(data.stats.totalBuyVolume)}</p>
          </div>
          <div class="bg-red-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-red-800">Verkaufsvolumen</h3>
            <p class="text-2xl font-bold text-red-700 mt-1">{formatCurrency(data.stats.totalSellVolume)}</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <h3 class="text-sm font-medium text-blue-800">Netto-Investition</h3>
            <p class="text-2xl font-bold mt-1" class:text-green-700={data.stats.netVolume >= 0} class:text-red-700={data.stats.netVolume < 0}>
              {formatCurrency(data.stats.netVolume)}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Filter und Sortierung -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="typeFilter" class="block text-sm font-medium text-gray-700">Transaktionstyp</label>
            <select 
              id="typeFilter" 
              bind:value={typeFilter}
              class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Alle Typen</option>
              <option value="buy">Nur Käufe</option>
              <option value="sell">Nur Verkäufe</option>
            </select>
          </div>
          <div>
            <label for="assetFilter" class="block text-sm font-medium text-gray-700">Asset</label>
            <select 
              id="assetFilter" 
              bind:value={assetFilter}
              class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Alle Assets</option>
              {#each data.assetOptions as symbol}
                <option value={symbol}>{symbol}</option>
              {/each}
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button 
              type="button" 
              class="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              on:click={applyFilters}
            >
              Filter anwenden
            </button>
            <button 
              type="button" 
              class="bg-gray-200 text-gray-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              on:click={resetFilters}
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>
      
      <!-- Transaktionstabelle -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {#if data.transactions.length === 0}
          <div class="p-6 text-center">
            <p class="text-gray-500">Keine Transaktionen gefunden.</p>
            {#if typeFilter !== 'all' || assetFilter}
              <p class="text-gray-500 mt-2">Versuche, deine Filter anzupassen oder <button class="text-blue-600 underline" on:click={resetFilters}>setze alle Filter zurück</button>.</p>
            {/if}
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => changeSort('timestamp')}>
                    <div class="flex items-center">
                      Zeitpunkt
                      {#if sortBy === 'timestamp'}
                        <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      {/if}
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => changeSort('type')}>
                    <div class="flex items-center">
                      Typ
                      {#if sortBy === 'type'}
                        <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      {/if}
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => changeSort('symbol')}>
                    <div class="flex items-center">
                      Asset
                      {#if sortBy === 'symbol'}
                        <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      {/if}
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => changeSort('quantity')}>
                    <div class="flex items-center justify-end">
                      Menge
                      {#if sortBy === 'quantity'}
                        <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      {/if}
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => changeSort('price')}>
                    <div class="flex items-center justify-end">
                      Kurs
                      {#if sortBy === 'price'}
                        <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      {/if}
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" on:click={() => changeSort('total')}>
                    <div class="flex items-center justify-end">
                      Gesamtbetrag
                      {#if sortBy === 'total'}
                        <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      {/if}
                    </div>
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each data.transactions as transaction}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(transaction.timestamp)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {transaction.type === 'buy' ? 'Kauf' : 'Verkauf'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        {#if transaction.imageUrl}
                          <img class="h-6 w-6 rounded-full mr-2" src={transaction.imageUrl} alt={transaction.symbol} />
                        {:else}
                          <div class="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <span class="text-xs font-medium">{transaction.symbol.substring(0, 2)}</span>
                          </div>
                        {/if}
                        <div>
                          <div class="text-sm font-medium text-gray-900">{transaction.name}</div>
                          <div class="text-xs text-gray-500">{transaction.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {transaction.quantity.toFixed(8)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span class={transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'}>
                        {transaction.type === 'buy' ? '-' : '+'}{formatCurrency(transaction.total)}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/trade/${transaction.assetId}`} class="text-blue-600 hover:text-blue-900">
                        Handeln
                      </a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
      
      <!-- Paginierung -->
      {#if data.pagination.totalPages > 1}
        <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-md">
          <div class="flex flex-1 justify-between sm:hidden">
            <button 
              on:click={() => goToPage(data.pagination.currentPage - 1)}
              disabled={data.pagination.currentPage === 1}
              class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <button 
              on:click={() => goToPage(data.pagination.currentPage + 1)}
              disabled={data.pagination.currentPage === data.pagination.totalPages}
              class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
          <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Zeige <span class="font-medium">{Math.min((data.pagination.currentPage - 1) * data.pagination.limit + 1, data.pagination.totalTransactions)}</span> bis <span class="font-medium">{Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.totalTransactions)}</span> von <span class="font-medium">{data.pagination.totalTransactions}</span> Ergebnissen
              </p>
            </div>
            <div>
              <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button 
                  on:click={() => goToPage(data.pagination.currentPage - 1)}
                  disabled={data.pagination.currentPage === 1}
                  class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Zurück</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                {#each getPageNumbers() as pageNum}
                  {#if pageNum === -1}
                    <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                      ...
                    </span>
                  {:else}
                    <button 
                      on:click={() => goToPage(pageNum)}
                      class={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${data.pagination.currentPage === pageNum ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                    >
                      {pageNum}
                    </button>
                  {/if}
                {/each}
                
                <button 
                  on:click={() => goToPage(data.pagination.currentPage + 1)}
                  disabled={data.pagination.currentPage === data.pagination.totalPages}
                  class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Weiter</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>