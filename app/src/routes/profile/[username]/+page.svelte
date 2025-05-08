<!-- src/routes/profile/[username]/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import PortfolioChart from '$lib/components/PortfolioChart.svelte';
    
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
    
    // Check if portfolio data exists
    const hasPortfolioData = data.canViewPortfolio && data.portfolio?.items?.length > 0;
    const hasTransactionData = data.canViewPortfolio && data?.recentTransactions?.length > 0;
    
    // Default profile image
    const defaultProfileImage = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    const profileImage = data.profileUser.profileImageUrl || defaultProfileImage;
  </script>
  
  <svelte:head>
    <title>{data.profileUser.username} | DHBWallet</title>
  </svelte:head>
  
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Profilheader -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6">
          <div class="flex flex-col md:flex-row items-center">
            <div class="flex-shrink-0 mb-4 md:mb-0">
              <img class="h-32 w-32 rounded-full object-cover" src={profileImage} alt="{data.profileUser.username}" />
            </div>
            <div class="md:ml-6 text-center md:text-left">
              <h1 class="text-2xl font-bold text-gray-900">{data.profileUser.username}</h1>
              {#if data.profileUser.bio}
                <p class="text-gray-600 mt-1 max-w-2xl">{data.profileUser.bio}</p>
              {/if}
              <p class="text-sm text-gray-500 mt-2">Mitglied seit {formatDate(data.profileUser.createdAt)}</p>
              
              {#if data.isOwner}
                <div class="mt-3">
                  <a href="/profile/edit" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Profil bearbeiten
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
      
      {#if !data.canViewPortfolio}
        <div class="bg-white rounded-lg shadow p-6 mb-6 text-center">
          <p class="text-gray-600">
            {data.profileUser.username} hat sein Portfolio als privat gekennzeichnet.
          </p>
        </div>
      {:else}
        <!-- Portfolio Performance -->
        {#if hasPortfolioData}
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h2>
              <div class="flex items-center mb-4">
                <div class="flex-1">
                  <p class="text-2xl font-bold text-gray-900">{formatCurrency(data.portfolio.totalValue)}</p>
                  <div class="flex items-center mt-1">
                    <span class={getProfitLossClass(data.portfolio.totalProfitLoss)}>
                      {formatCurrency(data.portfolio.totalProfitLoss)} ({formatPercent(data.portfolio.profitLossPercentage)})
                    </span>
                    <svg class={`h-4 w-4 ml-1 ${data.portfolio.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`} viewBox="0 0 20 20" fill="currentColor">
                      {#if data.portfolio.totalProfitLoss >= 0}
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                      {:else}
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                      {/if}
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Portfolio Chart für den Profilbenutzer -->
              <PortfolioChart userId={data.profileUser.id} color="#3B82F6" />
            </div>
          </div>
          
          <!-- Portfolio-Übersicht -->
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Anlagen von {data.profileUser.username}</h2>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bestand</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktueller Preis</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Wert</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gewinn/Verlust</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each data.portfolio.items || [] as item}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            {#if item.imageUrl}
                              <div class="flex-shrink-0 h-10 w-10">
                                <img class="h-10 w-10 rounded-full" src={item.imageUrl} alt={item.name} />
                              </div>
                            {:else}
                              <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span class="text-gray-500 font-bold">{item.symbol.substring(0, 2)}</span>
                              </div>
                            {/if}
                            <div class="ml-4">
                              <div class="text-sm font-medium text-gray-900">{item.name}</div>
                              <div class="text-sm text-gray-500">{item.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity.toFixed(6)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(item.currentPrice)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(Number(item.value))}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right">
                          <div class={getProfitLossClass(Number(item.profitLoss))}>
                            {formatCurrency(Number(item.profitLoss))}
                            <span class="text-xs ml-1">({formatPercent(Number(item.profitLossPercentage))})</span>
                          </div>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        {:else}
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-2">Keine Portfolio-Daten</h2>
            <p class="text-gray-600">
              {data.profileUser.username} hat noch keine Kryptowährungen in seinem Portfolio.
            </p>
          </div>
        {/if}
        
        <!-- Letzte Transaktionen -->
        {#if hasTransactionData}
          <div class="bg-white rounded-lg shadow">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Letzte Transaktionen</h2>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Menge</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each data.recentTransactions || [] as transaction}
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {transaction.type === 'buy' ? 'Kauf' : 'Verkauf'}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.name} ({transaction.symbol})
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {transaction.quantity.toFixed(6)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(transaction.price)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(transaction.total)}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>