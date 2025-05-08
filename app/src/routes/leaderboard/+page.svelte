<!-- src/routes/leaderboard/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    // Format helpers
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };
    
    const formatPercent = (value: number): string => {
      return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value / 100);
    };
    
    const formatDate = (dateInput: string | Date): string => {
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };
    
    // Helper to determine text color based on profit/loss
    const getProfitLossClass = (value: number): string => {
      return value >= 0 ? 'text-green-600' : 'text-red-600';
    };
  </script>
  
  <svelte:head>
    <title>Leaderboard | DHBWallet</title>
  </svelte:head>
  
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="bg-blue-600 px-6 py-4">
          <h1 class="text-xl font-bold text-white">Trader-Leaderboard</h1>
        </div>
        
        {#if data.currentUserRank}
          <div class="bg-blue-50 p-4 border-b border-blue-100">
            <p class="text-blue-700">
              Deine aktuelle Position: <span class="font-bold">{data.currentUserRank}. Platz</span> 
              von {data.leaderboard.length} Tradern
            </p>
          </div>
        {/if}
        
        {#if data.leaderboard.length === 0}
          <div class="p-6 text-center">
            <p class="text-gray-500">Noch keine Trader im Leaderboard.</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rang
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trader
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portfolio-Wert
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gewinn/Verlust
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendite
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dabei seit
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each data.leaderboard as entry, index}
                  {@const isCurrentUser = data.currentUserRank === index + 1}
                  <tr class={isCurrentUser ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="font-bold">{index + 1}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded-full object-cover" 
                               src={entry.user.profileImageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
                               alt={entry.user.username} />
                        </div>
                        <div class="ml-4">
                          <a href={`/profile/${entry.user.username}`} class="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {entry.user.username}
                            {#if isCurrentUser}
                              <span class="ml-1 text-blue-800">(Du)</span>
                            {/if}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatCurrency(entry.portfolioValue)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <span class={getProfitLossClass(entry.profitLoss)}>
                        {formatCurrency(entry.profitLoss)}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <span class={getProfitLossClass(entry.profitLossPercentage)}>
                        {formatPercent(entry.profitLossPercentage)}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {formatDate(entry.user.createdAt)}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>