<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    // Formatieren des Preises mit Tausendertrennzeichen und Währungssymbol
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };
  </script>
  
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Begrüßung und Kontostand -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Hallo, {data.user.username}!
            </h1>
            <p class="text-gray-600 mt-1">
              Willkommen in deinem Trading-Dashboard.
            </p>
          </div>
          <div class="mt-4 md:mt-0">
            <div class="text-sm text-gray-500">Dein Guthaben</div>
            <div class="text-2xl font-bold text-green-600">
              {formatCurrency(data.user.balance)}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Marktübersicht -->
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Marktübersicht</h2>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            Aktuelle Kryptowährungskurse
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kryptowährung
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurs
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.cryptos as crypto}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      {#if crypto.imageUrl}
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded-full" src={crypto.imageUrl} alt={crypto.name} />
                        </div>
                      {/if}
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{crypto.name}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                </tr>
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crypto.symbol}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(crypto.currentPrice)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <a href={`/trade/${crypto.id}`} class="text-blue-600 hover:text-blue-900">Kaufen/Verkaufen</a>
                  </td>
                </tr>
              {/each}
            </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  
            
            