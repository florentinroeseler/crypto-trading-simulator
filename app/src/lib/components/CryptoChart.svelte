<!-- src/lib/components/CryptoChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    export let symbol: string;
    export let name: string;
    export let color: string = '#3B82F6'; // Default: Blau
    
    let chartData = [];
    let isLoading = true;
    let error = null;
    
    // Chart-Konfiguration
    let timeframe = '7d'; // '1d', '7d', '30d', '90d', 'max'
    
    // Formatierungsfunktionen
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    };
    
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'short',
        timeStyle: timeframe === '1d' ? 'short' : undefined
      }).format(date);
    };
    
    // Zeichnen des Charts mit Canvas
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    
    function drawChart() {
      if (!canvas || !chartData || chartData.length === 0) return;
      
      ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      // Canvas-Größe anpassen
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Berechne Minimum und Maximum der Werte
      const prices = chartData.map(d => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      
      // Berechne Skalierung für die Y-Achse
      const padding = { top: 20, right: 50, bottom: 30, left: 10 };
      const chartHeight = rect.height - padding.top - padding.bottom;
      const chartWidth = rect.width - padding.left - padding.right;
      
      // Koordinaten für Preisdaten berechnen
      const points = chartData.map((d, i) => {
        const x = padding.left + (i / (chartData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight;
        return { x, y };
      });
      
      // Hintergrund löschen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Linien zeichnen
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.stroke();
      
      // Zeitachse zeichnen
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      const labelIndices = [];
      for (let i = 0; i < numLabels; i++) {
        labelIndices.push(Math.floor((i / (numLabels - 1)) * (chartData.length - 1)));
      }
      
      labelIndices.forEach(index => {
        const point = points[index];
        const timestamp = chartData[index].timestamp;
        ctx.fillText(formatDate(timestamp), point.x, rect.height - 10);
      });
      
      // Preisachse zeichnen (rechts)
      ctx.textAlign = 'right';
      
      // Min und Max-Werte anzeigen
      ctx.fillText(formatCurrency(minPrice), rect.width - 5, padding.top + chartHeight);
      ctx.fillText(formatCurrency(maxPrice), rect.width - 5, padding.top);
      
      // Aktueller Preis
      const lastPrice = chartData[chartData.length - 1].price;
      const lastY = points[points.length - 1].y;
      
      ctx.fillStyle = color;
      ctx.fillText(formatCurrency(lastPrice), rect.width - 5, lastY);
      
      // Punkt am Ende der Linie
      ctx.beginPath();
      ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    async function fetchChartData() {
      isLoading = true;
      error = null;
      
      try {
        // Bestimme das Zeitfenster basierend auf timeframe
        let days;
        switch (timeframe) {
          case '1d': days = 1; break;
          case '7d': days = 7; break;
          case '30d': days = 30; break;
          case '90d': days = 90; break;
          case 'max': days = 'max'; break;
          default: days = 7;
        }
        
        // API-URL für CoinGecko
        const url = `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=eur&days=${days}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Fehler beim Abrufen der Kursdaten: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Daten aufbereiten
        chartData = data.prices.map(item => ({
          timestamp: item[0],
          price: item[1]
        }));
        
        // Warten bis der nächste Frame gerendert wurde
        await new Promise(resolve => setTimeout(resolve, 0));
        drawChart();
      } catch (err) {
        console.error('Fehler beim Laden der Chart-Daten:', err);
        error = err.message;
        
        // Fallback: Dummy-Daten generieren, wenn API-Anfragen Rate-Limited sind
        generateDummyData();
      } finally {
        isLoading = false;
      }
    }
    
    // Generiert Dummy-Daten für den Chart als Fallback
    function generateDummyData() {
      // Ausgangspreis
      const basePrice = 1000 + Math.random() * 9000;
      const now = Date.now();
      
      // Zeitraum bestimmen
      let timeRange;
      switch (timeframe) {
        case '1d': timeRange = 24 * 60 * 60 * 1000; break; // 1 Tag in ms
        case '7d': timeRange = 7 * 24 * 60 * 60 * 1000; break; // 7 Tage
        case '30d': timeRange = 30 * 24 * 60 * 60 * 1000; break; // 30 Tage
        case '90d': timeRange = 90 * 24 * 60 * 60 * 1000; break; // 90 Tage
        case 'max': timeRange = 365 * 24 * 60 * 60 * 1000; break; // 1 Jahr
        default: timeRange = 7 * 24 * 60 * 60 * 1000; // 7 Tage
      }
      
      // Anzahl der Datenpunkte
      const numPoints = 100;
      const dummyData = [];
      
      // Zufällige Daten generieren
      for (let i = 0; i < numPoints; i++) {
        const timestamp = now - (timeRange * (1 - i / numPoints));
        
        // Preis mit leichten Schwankungen um den Basispreis
        const randomFactor = 1 + (Math.random() * 0.4 - 0.2); // +/- 20%
        const price = basePrice * randomFactor;
        
        dummyData.push({
          timestamp,
          price
        });
      }
      
      chartData = dummyData;
      drawChart();
    }
    
    // Aktualisiere den Chart, wenn der Zeitrahmen geändert wird
    $: {
      timeframe;
      if (canvas) fetchChartData();
    }
    
    // Fenstergrößenänderungen behandeln
    function handleResize() {
      if (canvas && chartData.length > 0) {
        drawChart();
      }
    }
    
    onMount(() => {
      window.addEventListener('resize', handleResize);
      fetchChartData();
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
  </script>
  
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{name} Kursentwicklung</h3>
      
      <div class="timeframe-selector">
        <button 
          class="timeframe-btn" 
          class:active={timeframe === '1d'} 
          on:click={() => timeframe = '1d'}
        >
          1T
        </button>
        <button 
          class="timeframe-btn" 
          class:active={timeframe === '7d'} 
          on:click={() => timeframe = '7d'}
        >
          7T
        </button>
        <button 
          class="timeframe-btn" 
          class:active={timeframe === '30d'} 
          on:click={() => timeframe = '30d'}
        >
          30T
        </button>
        <button 
          class="timeframe-btn" 
          class:active={timeframe === '90d'} 
          on:click={() => timeframe = '90d'}
        >
          90T
        </button>
        <button 
          class="timeframe-btn" 
          class:active={timeframe === 'max'} 
          on:click={() => timeframe = 'max'}
        >
          Max
        </button>
      </div>
    </div>
    
    <div class="chart-content">
      {#if isLoading}
        <div class="loading">Lade Kursdaten...</div>
      {:else if error}
        <div class="error">
          <p>Fehler beim Laden der Kursdaten: {error}</p>
          <p>Wir zeigen dir stattdessen simulierte Daten.</p>
        </div>
      {/if}
      
      <canvas bind:this={canvas} width="800" height="400"></canvas>
    </div>
  </div>
  
  <style>
    .chart-container {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }
    
    .timeframe-selector {
      display: flex;
      gap: 0.25rem;
    }
    
    .timeframe-btn {
      background-color: #f3f4f6;
      border: none;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .timeframe-btn:hover {
      background-color: #e5e7eb;
    }
    
    .timeframe-btn.active {
      background-color: #3b82f6;
      color: white;
    }
    
    .chart-content {
      position: relative;
      height: 300px;
    }
    
    canvas {
      width: 100%;
      height: 100%;
    }
    
    .loading, .error {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 10;
      padding: 1rem;
      text-align: center;
      color: #4b5563;
    }
    
    .error {
      color: #dc2626;
    }
  </style>