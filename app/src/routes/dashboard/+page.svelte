<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import SeedDataButton from '$lib/components/SeedDataButton.svelte';
  import PortfolioChart from '$lib/components/PortfolioChart.svelte';
  import AdminAssets from '$lib/components/AdminAssets.svelte';
	import AdminManagement from '$lib/components/AdminManagement.svelte';
  
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Helper to determine text color based on profit/loss
  const getProfitLossClass = (value: number): string => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };
  
  // Portfolio and balance data with fallbacks
  const portfolioValue = data.portfolio?.totalValue || 0;
  const totalAssets = portfolioValue + data.user.balance;
  const cashPercentage = (data.user.balance / Math.max(totalAssets, 1)) * 100;
  const investedPercentage = (portfolioValue / Math.max(totalAssets, 1)) * 100;
  
  // Prüfen, ob Portfolio-Daten existieren
  const hasPortfolioData = data.portfolio?.items?.length > 0;
  const hasTransactionData = data?.recentTransactions?.length > 0;
  
  // Prüfen, ob der Benutzer Admin ist
  const isAdmin = data.user?.isAdmin || false;
</script>

<svelte:head>
  <title>Dashboard | Crypto Trading Simulator</title>
</svelte:head>

<div class="bg-gray-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Admin-Assets-Komponente (nur für Admins sichtbar) -->
    <AdminAssets isAdmin={false} />
    
    <!-- Admin-Management-Komponente (nur für Admins sichtbar) -->        
    <AdminManagement isAdmin={false} />
    
    <!-- Testdaten-Generator (nur anzeigen, wenn keine Portfoliodaten vorhanden sind) -->
    {#if !hasPortfolioData}
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-2">Keine Portfolio-Daten gefunden</h2>
        <p class="text-gray-600 mb-4">
          Du hast noch keine Kryptowährungen in deinem Portfolio. Du kannst Testdaten generieren,
          um das Dashboard mit Beispieltransaktionen zu füllen.
        </p>
        
        <SeedDataButton />
      </div>
    {/if}
    
    <!-- Übersichtskarten -->
    <div class="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
      <!-- Gesamtvermögen -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-medium text-gray-500">Gesamtvermögen</h2>
          {#if data.portfolio?.totalProfitLoss}
            <div class="flex items-center gap-1">
              <span class={data.portfolio.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercent(data.portfolio.profitLossPercentage || 0)}
              </span>
              <svg class={`h-4 w-4 ${data.portfolio.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"}`} viewBox="0 0 20 20" fill="currentColor">
                {#if data.portfolio.totalProfitLoss >= 0}
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                {:else}
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                {/if}
              </svg>
            </div>
          {/if}
        </div>
        <div class="mt-2">
          <p class="text-3xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
          {#if data.portfolio?.totalProfitLoss}
            <p class="text-sm text-gray-500 mt-1">
              Gewinn/Verlust: 
              <span class={getProfitLossClass(data.portfolio.totalProfitLoss)}>
                {formatCurrency(data.portfolio.totalProfitLoss)}
              </span>
            </p>
          {/if}
        </div>
      </div>
      
      <!-- Verfügbar -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm font-medium text-gray-500">Verfügbares Guthaben</h2>
        <div class="mt-2">
          <p class="text-3xl font-bold text-gray-900">{formatCurrency(data.user.balance)}</p>
          <p class="text-sm text-gray-500 mt-1">{formatPercent(cashPercentage)} deines Gesamtvermögens</p>
        </div>
      </div>
      
      <!-- Investiert -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-sm font-medium text-gray-500">Investiertes Vermögen</h2>
        <div class="mt-2">
          <p class="text-3xl font-bold text-gray-900">{formatCurrency(portfolioValue)}</p>
          <p class="text-sm text-gray-500 mt-1">{formatPercent(investedPercentage)} deines Gesamtvermögens</p>
        </div>
      </div>
    </div>
    
    <!-- Portfolio-Chart -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-6">
        <!-- Hier kommt die neue PortfolioChart-Komponente -->
        <PortfolioChart balance={data.user.balance} color="#3B82F6" />
      </div>
    </div>
    
    <!-- Portfolio-Übersicht -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Deine Anlagen</h2>
        
        {#if !hasPortfolioData}
          <div class="text-center p-6 bg-gray-50 rounded-lg">
            <p class="text-gray-600">Du hast noch keine Kryptowährungen in deinem Portfolio.</p>
            <a href="/cryptos" class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Starte mit deinem ersten Trade
            </a>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bestand</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ø Kaufpreis</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktueller Preis</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Wert</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gewinn/Verlust</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each data.portfolio?.items || [] as item}
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
                      {formatCurrency(item.averageBuyPrice)}
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
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/trade/${item.assetId}`} class="text-blue-600 hover:text-blue-900">Handeln</a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Letzte Transaktionen -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Letzte Transaktionen</h2>
        
        {#if !hasTransactionData}
          <div class="text-center p-6 bg-gray-50 rounded-lg">
            <p class="text-gray-600">Du hast noch keine Transaktionen durchgeführt.</p>
          </div>
        {:else}
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
            
            <div class="mt-4 text-right">
              <a href="/transactions" class="text-sm text-blue-600 hover:text-blue-900">
                Alle Transaktionen anzeigen →
              </a>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>