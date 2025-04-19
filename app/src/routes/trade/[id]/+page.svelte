<!-- src/routes/trade/[id]/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  // Importiere statt CryptoChart die neue SimpleChart-Komponente
  import SimpleChart from '$lib/components/SimpleChart.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  export let form;
  
  let { asset, portfolio, recentTransactions, user } = data;
  let quantity = 0;
  let totalPrice = 0;
  let formAction = 'buy';
  
  // Formatierungsfunktionen
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };
  
  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  };
  
  // Berechne Gesamtpreis basierend auf der Menge
  $: totalPrice = quantity * asset.currentPrice;
  
  // Maximale Kaufmenge basierend auf dem Guthaben
  $: maxBuyAmount = user.balance / asset.currentPrice;
  
  // Verfügbare Verkaufsmenge
  $: availableSellAmount = portfolio.quantity;
  
  // Handel-Farben
  $: tradeColor = formAction === 'buy' ? 'green' : 'red';
  $: tradeButtonColor = formAction === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
  
  // Setze die Handelsaktion
  function setTradeAction(action: 'buy' | 'sell') {
    formAction = action;
    quantity = 0; // Zurücksetzen der Menge bei Änderung der Aktion
  }
  
  // Setze die Menge auf das Maximum
  function setMaxAmount() {
    if (formAction === 'buy') {
      quantity = Math.floor(maxBuyAmount * 10000) / 10000; // Auf 4 Nachkommastellen runden
    } else {
      quantity = availableSellAmount;
    }
  }
</script>

<svelte:head>
  <title>{asset.name} ({asset.symbol}) | Krypto-Trader</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-4">
      {#if asset.imageUrl}
        <img src={asset.imageUrl} alt={asset.symbol} class="w-12 h-12" />
      {/if}
      <div>
        <h1 class="text-3xl font-bold">{asset.name}</h1>
        <p class="text-gray-600">{asset.symbol}</p>
      </div>
    </div>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Linke Spalte - Chart und Details -->
    <div class="lg:col-span-2">
      <!-- Chart - Hier verwenden wir die neue SimpleChart-Komponente -->
      <SimpleChart symbol={asset.symbol} name={asset.name} color={formAction === 'buy' ? "#047857" : "#DC2626"} />
      
      <!-- Asset-Details -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Details</h2>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="p-3 bg-gray-50 rounded">
            <h3 class="text-sm text-gray-500">Aktueller Kurs</h3>
            <p class="text-lg font-semibold">{formatCurrency(asset.currentPrice)}</p>
          </div>
          
          {#if asset.marketCap}
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">Marktkapitalisierung</h3>
              <p class="text-lg font-semibold">{formatCurrency(asset.marketCap)}</p>
            </div>
          {/if}
          
          {#if asset.priceChangePercentage24h !== undefined && asset.priceChangePercentage24h !== null}
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">24h Änderung</h3>
              <p class="text-lg font-semibold" class:text-green-600={asset.priceChangePercentage24h >= 0} class:text-red-600={asset.priceChangePercentage24h < 0}>
                {asset.priceChangePercentage24h >= 0 ? '+' : ''}{asset.priceChangePercentage24h.toFixed(2)}%
              </p>
            </div>
          {/if}
          
          {#if asset.volume24h}
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">24h Volumen</h3>
              <p class="text-lg font-semibold">{formatCurrency(asset.volume24h)}</p>
            </div>
          {/if}
          
          {#if asset.circulatingSupply}
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">Im Umlauf</h3>
              <p class="text-lg font-semibold">{new Intl.NumberFormat('de-DE').format(asset.circulatingSupply)} {asset.symbol}</p>
            </div>
          {/if}
          
          {#if asset.maxSupply}
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">Maximale Menge</h3>
              <p class="text-lg font-semibold">{new Intl.NumberFormat('de-DE').format(asset.maxSupply)} {asset.symbol}</p>
            </div>
          {/if}
        </div>
        
        <p class="text-sm text-gray-500 mt-4">
          Zuletzt aktualisiert: {formatDateTime(asset.lastUpdated)}
        </p>
      </div>
      
      <!-- Transaktionsverlauf -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Deine Transaktionen</h2>
        
        {#if recentTransactions.length > 0}
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="bg-gray-100">
                  <th class="py-2 px-4 text-left">Typ</th>
                  <th class="py-2 px-4 text-right">Menge</th>
                  <th class="py-2 px-4 text-right">Preis</th>
                  <th class="py-2 px-4 text-right">Gesamt</th>
                  <th class="py-2 px-4 text-center">Zeitpunkt</th>
                </tr>
              </thead>
              <tbody>
                {#each recentTransactions as transaction}
                  <tr class="border-t border-gray-200 hover:bg-gray-50">
                    <td class="py-2 px-4">
                      <span 
                        class="inline-block px-2 py-1 text-xs font-semibold rounded-full" 
                        class:bg-green-100={transaction.type === 'buy'} 
                        class:text-green-800={transaction.type === 'buy'}
                        class:bg-red-100={transaction.type === 'sell'} 
                        class:text-red-800={transaction.type === 'sell'}
                      >
                        {transaction.type === 'buy' ? 'Kauf' : 'Verkauf'}
                      </span>
                    </td>
                    <td class="py-2 px-4 text-right">{transaction.quantity.toFixed(8)} {asset.symbol}</td>
                    <td class="py-2 px-4 text-right">{formatCurrency(transaction.price)}</td>
                    <td class="py-2 px-4 text-right font-medium">{formatCurrency(transaction.total)}</td>
                    <td class="py-2 px-4 text-center text-sm text-gray-500">{formatDateTime(transaction.timestamp)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-gray-500">Du hast noch keine Transaktionen mit {asset.symbol} durchgeführt.</p>
        {/if}
      </div>
    </div>
    
    <!-- Rechte Spalte - Handelsformular und Portfolio -->
    <div class="lg:col-span-1">
      <!-- Portfolio-Übersicht -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Dein Portfolio</h2>
        
        <div class="grid grid-cols-1 gap-4">
          <div class="p-3 bg-gray-50 rounded">
            <h3 class="text-sm text-gray-500">Verfügbares Guthaben</h3>
            <p class="text-lg font-semibold">{formatCurrency(user.balance)}</p>
          </div>
          
          <div class="p-3 bg-gray-50 rounded">
            <h3 class="text-sm text-gray-500">{asset.symbol} im Bestand</h3>
            <p class="text-lg font-semibold">{portfolio.quantity.toFixed(8)} {asset.symbol}</p>
          </div>
          
          {#if portfolio.quantity > 0}
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">Wert deines {asset.symbol}-Bestands</h3>
              <p class="text-lg font-semibold">{formatCurrency(portfolio.quantity * asset.currentPrice)}</p>
            </div>
            
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">Durchschnittlicher Kaufpreis</h3>
              <p class="text-lg font-semibold">{formatCurrency(portfolio.averageBuyPrice)}</p>
            </div>
            
            {@const profit = (asset.currentPrice - portfolio.averageBuyPrice) * portfolio.quantity}
            {@const profitPercent = ((asset.currentPrice / portfolio.averageBuyPrice) - 1) * 100}
            
            <div class="p-3 bg-gray-50 rounded">
              <h3 class="text-sm text-gray-500">Gewinn/Verlust</h3>
              <p class="text-lg font-semibold" class:text-green-600={profit >= 0} class:text-red-600={profit < 0}>
                {formatCurrency(profit)} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
              </p>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Handelsformular -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Handel</h2>
        
        <!-- Handelsart-Tabs -->
        <div class="flex mb-6 border-b">
          <button 
            class="flex-1 py-2 text-center font-medium border-b-2 transition-colors" 
            class:text-green-600={formAction === 'buy'} 
            class:border-green-600={formAction === 'buy'} 
            class:text-gray-500={formAction !== 'buy'} 
            class:border-transparent={formAction !== 'buy'} 
            on:click={() => setTradeAction('buy')}
          >
            Kaufen
          </button>
          <button 
            class="flex-1 py-2 text-center font-medium border-b-2 transition-colors" 
            class:text-red-600={formAction === 'sell'} 
            class:border-red-600={formAction === 'sell'} 
            class:text-gray-500={formAction !== 'sell'} 
            class:border-transparent={formAction !== 'sell'} 
            on:click={() => setTradeAction('sell')}
          >
            Verkaufen
          </button>
        </div>
        
        <!-- Formular -->
        <form method="POST" action="?/{formAction}" use:enhance>
          <div class="mb-4">
            <label for="quantity" class="block mb-2 font-medium text-gray-700">
              Menge {asset.symbol}
            </label>
            <div class="flex items-center">
              <input 
                type="number" 
                id="quantity" 
                name="quantity" 
                bind:value={quantity} 
                min="0" 
                step="0.00000001" 
                required 
                class="flex-1 p-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-{tradeColor}-500 focus:border-{tradeColor}-500" 
              />
              <button 
                type="button" 
                class="bg-gray-200 text-gray-800 px-3 py-2 rounded-r hover:bg-gray-300" 
                on:click={setMaxAmount}
              >
                Max
              </button>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              {#if formAction === 'buy'}
                Maximal: {maxBuyAmount.toFixed(8)} {asset.symbol}
              {:else}
                Verfügbar: {availableSellAmount.toFixed(8)} {asset.symbol}
              {/if}
            </p>
          </div>
          
          <div class="mb-6">
            <label class="block mb-2 font-medium text-gray-700">
              Gesamtpreis
            </label>
            <div class="p-2 bg-gray-100 rounded flex justify-between items-center">
              <span class="text-lg font-bold">{formatCurrency(totalPrice)}</span>
              <span class="text-sm text-gray-500">
                @ {formatCurrency(asset.currentPrice)} pro {asset.symbol}
              </span>
            </div>
          </div>
          
          <!-- Erfolgsnachricht oder Fehler anzeigen -->
          {#if form}
            <div class="mb-4 p-3 rounded text-sm" class:bg-green-100={form.success} class:text-green-800={form.success} class:bg-red-100={!form.success} class:text-red-800={!form.success}>
              {form.message}
            </div>
          {/if}
          
          <!-- Submit-Button -->
          <button 
            type="submit" 
            class="w-full py-3 px-4 text-white font-medium rounded transition-colors {tradeButtonColor}" 
            disabled={
              (formAction === 'buy' && (quantity <= 0 || totalPrice > user.balance)) || 
              (formAction === 'sell' && (quantity <= 0 || quantity > portfolio.quantity))
            }
          >
            {formAction === 'buy' ? 'Kaufen' : 'Verkaufen'}
          </button>
        </form>
      </div>
    </div>
  </div>
</div>