<svelte:head>
  <title>{data.asset.name} | Trading | Crypto Trading Simulator</title>
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Asset Header -->
    <div class="mb-6">
      <div class="flex items-center mb-4">
        <a href="/trade" class="text-blue-600 hover:text-blue-800 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900">
          {#if data.asset.imageUrl}
            <img src={data.asset.imageUrl} alt={data.asset.name} class="w-8 h-8 inline mr-2 rounded-full" />
          {/if}
          {data.asset.name} ({data.asset.symbol})
        </h1>
      </div>
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-lg shadow mb-6">
        <div>
          <p class="text-gray-500 text-sm">Aktueller Preis</p>
          <p class="text-2xl font-bold">{formatCurrency(data.asset.currentPrice)}</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <p class="text-gray-500 text-sm">Dein Bestand</p>
          <p class="text-xl font-medium">
            {formatCryptoAmount(data.portfolio.quantity)} {data.asset.symbol}
            {#if data.portfolio.quantity > 0}
              <span class="text-gray-500 text-sm ml-1">
                (≈ {formatCurrency(data.portfolio.quantity * data.asset.currentPrice)})
              </span>
            {/if}
          </p>
        </div>
      </div>
    </div>

    <!-- Preisentwicklung -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Preisentwicklung</h2>
          <div class="flex space-x-2">
            <button 
              class={`px-3 py-1 text-sm rounded-md ${chartPeriod === '1D' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              on:click={() => updateChartPeriod('1D')}
            >
              1T
            </button>
            <button 
              class={`px-3 py-1 text-sm rounded-md ${chartPeriod === '1W' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              on:click={() => updateChartPeriod('1W')}
            >
              1W
            </button>
            <button 
              class={`px-3 py-1 text-sm rounded-md ${chartPeriod === '1M' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              on:click={() => updateChartPeriod('1M')}
            >
              1M
            </button>
            <button 
              class={`px-3 py-1 text-sm rounded-md ${chartPeriod === '1Y' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              on:click={() => updateChartPeriod('1Y')}
            >
              1J
            </button>
          </div>
        </div>
      </div>
      <div class="p-6">
        <div class="h-64 w-full" bind:this={chartContainer}>
          <svg width={svgWidth} height={svgHeight} class="w-full">
            <path 
              d={pathD} 
              stroke="#3B82F6" 
              stroke-width="2" 
              fill="none" 
            />
            <!-- Farbverlauf unterhalb der Linie -->
            <path 
              d={`${pathD} L${svgWidth},${svgHeight} L0,${svgHeight} Z`} 
              fill="url(#blue-gradient)" 
              opacity="0.2" 
            />
            <!-- Definiere Farbverlauf -->
            <defs>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3B82F6" />
                <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
          
          <!-- Hinweis auf Demo-Daten -->
          <div class="text-center text-sm text-gray-500 mt-2">
            Hinweis: Dies ist ein Beispielchart. Echtzeitkurse werden später implementiert.
          </div>
        </div>
      </div>
    </div>

    <!-- Trading-Bereich -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Kaufen -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Kaufen</h2>
        
        <form method="POST" action="?/buy" use:enhance>
          <div class="mb-4">
            <label for="buyQuantity" class="block text-sm font-medium text-gray-700 mb-1">
              Menge ({data.asset.symbol})
            </label>
            <input
              id="buyQuantity"
              name="quantity"
              type="number"
              step="0.000001"
              min="0.000001"
              bind:value={buyQuantity}
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
              required
            />
          </div>
          
          <div class="flex justify-between text-sm text-gray-500 mb-4">
            <span>Aktueller Preis:</span>
            <span>{formatCurrency(data.asset.currentPrice)}</span>
          </div>
          
          <div class="flex justify-between font-medium mb-6">
            <span>Gesamtbetrag:</span>
            <span>{formatCurrency(buyPreview)}</span>
          </div>
          
          <div class="text-sm text-gray-500 mb-4">
            Verfügbares Guthaben: {formatCurrency(data.user.balance)}
          </div>
          
          <button
            type="submit"
            class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={buyPreview > data.user.balance || buyPreview <= 0}
          >
            Kaufen
          </button>
          
          {#if form?.success === false && form?.message && form?._action === 'buy'}
            <p class="mt-2 text-sm text-red-600">{form.message}</p>
          {/if}
        </form>
      </div>
      
      <!-- Verkaufen -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Verkaufen</h2>
        
        <form method="POST" action="?/sell" use:enhance>
          <div class="mb-4">
            <label for="sellQuantity" class="block text-sm font-medium text-gray-700 mb-1">
              Menge ({data.asset.symbol})
            </label>
            <input
              id="sellQuantity"
              name="quantity"
              type="number"
              step="0.000001"
              min="0.000001"
              max={data.portfolio.quantity}
              bind:value={sellQuantity}
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
              required
            />
          </div>
          
          <div class="flex justify-between text-sm text-gray-500 mb-4">
            <span>Aktueller Preis:</span>
            <span>{formatCurrency(data.asset.currentPrice)}</span>
          </div>
          
          <div class="flex justify-between font-medium mb-6">
            <span>Verkaufserlös:</span>
            <span>{formatCurrency(sellPreview)}</span>
          </div>
          
          <div class="text-sm text-gray-500 mb-4">
            Verfügbarer Bestand: {formatCryptoAmount(data.portfolio.quantity)} {data.asset.symbol}
          </div>
          
          <button
            type="submit"
            class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={parseFloat(sellQuantity) > data.portfolio.quantity || parseFloat(sellQuantity) <= 0 || isNaN(parseFloat(sellQuantity))}
          >
            Verkaufen
          </button>
          
          {#if form?.success === false && form?.message && form?._action === 'sell'}
            <p class="mt-2 text-sm text-red-600">{form.message}</p>
          {/if}
        </form>
      </div>
    </div>
    
    <!-- Erfolgsmeldung -->
    {#if form?.success}
      <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{form.message}</p>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Transaktionshistorie -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h2 class="text-lg font-medium text-gray-900">Deine Transaktionen</h2>
      </div>
      
      {#if data.recentTransactions.length === 0}
        <div class="p-6 text-center text-gray-500">
          Du hast noch keine Transaktionen mit {data.asset.symbol} durchgeführt.
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Menge</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gesamt</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each data.recentTransactions as transaction}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.timestamp)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {transaction.type === 'buy' ? 'Kauf' : 'Verkauf'}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCryptoAmount(transaction.quantity)}
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
      {/if}
    </div>
  </div>
</div>
<script lang="ts">
    import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';
    
    export let data: PageData;
    export let form: ActionData;
    
    // Transaktionsdaten
    let buyQuantity = '';
    let sellQuantity = '';
    let buyPreview = 0;
    let sellPreview = 0;
    
    // Chart-Daten (Mock-Daten, später durch echte Daten ersetzen)
    let chartPeriod = '1W';
    let chartData: {date: string, price: number}[] = [];
    let svgWidth = 0;
    let svgHeight = 300;
    let chartContainer: HTMLDivElement;
    
    // Generiere Mock-Daten für den Chart
    function generateMockChartData(currentPrice: number) {
      const data = [];
      const periods = chartPeriod === '1D' ? 24 : 
                      chartPeriod === '1W' ? 7 : 
                      chartPeriod === '1M' ? 30 : 
                      chartPeriod === '1Y' ? 12 : 7;
      
      const maxVariation = currentPrice * 0.15; // Maximale Variation 15%
      
      let price = currentPrice;
      const now = new Date();
      
      for (let i = periods; i >= 0; i--) {
        // Zufällige Preisänderung mit etwas Trends
        const change = (Math.random() - 0.48) * maxVariation / periods;
        price = Math.max(0.01, price + change);
        
        const date = new Date();
        if (chartPeriod === '1D') {
          date.setHours(now.getHours() - i);
        } else if (chartPeriod === '1W') {
          date.setDate(now.getDate() - i);
        } else if (chartPeriod === '1M') {
          date.setDate(now.getDate() - i);
        } else if (chartPeriod === '1Y') {
          date.setMonth(now.getMonth() - i);
        }
        
        data.push({
          date: date.toISOString(),
          price: price
        });
      }
      
      // Stelle sicher, dass der aktuelle Preis am Ende steht
      data[data.length - 1].price = currentPrice;
      
      return data;
    }
    
    // Chart-Pfad generieren
    function createChartPath(data: {date: string, price: number}[], width: number, height: number): string {
      if (width === 0 || data.length === 0) return '';
      
      const xScale = width / (data.length - 1);
      const values = data.map(d => d.price);
      const min = Math.min(...values) * 0.95; // 5% padding
      const max = Math.max(...values) * 1.05; // 5% padding
      const yScale = height / (max - min);
      
      return data.map((d, i) => {
        const x = i * xScale;
        const y = height - (d.price - min) * yScale;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
    }
    
    // Zeitraum ändern und Chart aktualisieren
    function updateChartPeriod(period: string) {
      chartPeriod = period;
      chartData = generateMockChartData(data.asset.currentPrice);
    }
    
    // Formatierungsfunktionen
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    };
    
    const formatCryptoAmount = (amount: number): string => {
      if (amount === 0) return '0';
      
      // Für sehr kleine Beträge wissenschaftliche Notation vermeiden
      if (amount < 0.000001) {
        return amount.toFixed(10).replace(/\.?0+$/, '');
      }
      
      return amount.toFixed(6).replace(/\.?0+$/, '');
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
    
    // Chart-Pfad generieren
    $: pathD = createChartPath(chartData, svgWidth, svgHeight);
    
    // Kaufvorschau aktualisieren
    $: {
      const qty = parseFloat(buyQuantity);
      buyPreview = !isNaN(qty) ? qty * data.asset.currentPrice : 0;
    }
    
    // Verkaufsvorschau aktualisieren
    $: {
      const qty = parseFloat(sellQuantity);
      sellPreview = !isNaN(qty) ? qty * data.asset.currentPrice : 0;
    }
    
    // Chart bei Komponentenmontage initialisieren
    onMount(() => {
      chartData = generateMockChartData(data.asset.currentPrice);
      
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          svgWidth = entry.contentRect.width;
        }
      });
      
      if (chartContainer) {
        resizeObserver.observe(chartContainer);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    });
  </script>