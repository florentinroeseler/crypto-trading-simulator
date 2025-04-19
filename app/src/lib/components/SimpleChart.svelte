<!-- src/lib/components/SimpleChart.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    export let symbol: string;
    export let name: string;
    export let color: string = '#3B82F6'; // Default: Blau
    
    let chartData = [];
    let isLoading = true;
    let errorMessage: string | null = null;
    let useMockData = false;
    let mounted = false;
    
    // Chart-Konfiguration
    let timeframe = '7d'; // '1d', '7d', '30d', '90d'
    let lastTimeframe = timeframe; // Um unnötige Neuladen zu vermeiden
    
    // Hover-Status
    let hoverIndex: number | null = null;
    let showTooltip = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipPrice = 0;
    let tooltipDate = '';
    
    // Chart-Dimensionen
    let padding = { top: 20, right: 50, bottom: 30, left: 60 };
    let chartWidth = 0;
    let chartHeight = 0;
    
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
      
      if (timeframe === '1d') {
        // Nur Uhrzeit für 1-Tages-Ansicht
        return new Intl.DateTimeFormat('de-DE', {
          timeStyle: 'short'
        }).format(date);
      } else {
        // Datum für längere Zeiträume
        return new Intl.DateTimeFormat('de-DE', {
          dateStyle: 'short'
        }).format(date);
      }
    };
    
    // Vollständiges Datum und Uhrzeit für Tooltip
    const formatFullDateTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    };
    
    // Zeichnen des Charts mit Canvas
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let canvasContainer: HTMLDivElement;
    
    function drawChart(highlightIndex: number | null = null) {
      if (!canvas || !chartData || chartData.length === 0) return;
      
      ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      
      // Canvas-Größe anpassen
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Chart-Dimensionen berechnen
      chartWidth = rect.width - padding.left - padding.right;
      chartHeight = rect.height - padding.top - padding.bottom;
      
      // Berechne Minimum und Maximum der Werte
      const prices = chartData.map(d => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      
      // Hintergrund löschen
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid-Linien zeichnen
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      
      // Y-Achsen-Werte berechnen (5 Werte gleichmäßig verteilt)
      const yAxisValues = [];
      const numYAxisValues = 5;
      
      for (let i = 0; i < numYAxisValues; i++) {
        const value = minPrice + (priceRange * (i / (numYAxisValues - 1)));
        yAxisValues.push(value);
      }
      
      // Grid-Linien für Y-Achse zeichnen
      for (const value of yAxisValues) {
        const y = padding.top + chartHeight - ((value - minPrice) / priceRange) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        
        // Y-Achsenbeschriftung
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(formatCurrency(value), padding.left - 10, y + 4);
      }
      
      // Koordinaten für Preisdaten berechnen
      const points = chartData.map((d, i) => {
        const x = padding.left + (i / (chartData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((d.price - minPrice) / priceRange) * chartHeight;
        return { x, y, price: d.price, timestamp: d.timestamp };
      });
      
      // Kurven-Linie zeichnen
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
      
      // Wir zeigen weniger Labels, um Überlappungen zu vermeiden
      const numLabels = timeframe === '1d' ? 6 : 7;
      const labelIndices = [];
      for (let i = 0; i < numLabels; i++) {
        labelIndices.push(Math.floor((i / (numLabels - 1)) * (chartData.length - 1)));
      }
      
      // X-Achsenlinie
      ctx.strokeStyle = '#ccc';
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);
      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.stroke();
      
      // Zeit-Labels
      labelIndices.forEach(index => {
        const point = points[index];
        const timestamp = chartData[index].timestamp;
        ctx.fillText(formatDate(timestamp), point.x, rect.height - 10);
      });
      
      // Aktueller Preis
      const lastPrice = chartData[chartData.length - 1].price;
      const lastY = points[points.length - 1].y;
      
      ctx.fillStyle = color;
      ctx.fillText(formatCurrency(lastPrice), padding.left + chartWidth + 30, lastY);
      
      // Wenn ein Punkt hervorgehoben werden soll (Hover)
      if (highlightIndex !== null && highlightIndex >= 0 && highlightIndex < points.length) {
        const point = points[highlightIndex];
        
        // Vertikale Linie zum hervorgehobenen Punkt
        ctx.strokeStyle = '#888';
        ctx.setLineDash([4, 4]); // Gestrichelte Linie
        ctx.beginPath();
        ctx.moveTo(point.x, padding.top);
        ctx.lineTo(point.x, padding.top + chartHeight);
        ctx.stroke();
        ctx.setLineDash([]); // Linien-Stil zurücksetzen
        
        // Hervorgehobener Punkt größer zeichnen
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Weiße Umrandung
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Standardpunkt am Ende der Linie
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(points[points.length - 1].x, points[points.length - 1].y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Mausbewegung über dem Chart verarbeiten
    function handleMouseMove(event) {
      if (!chartData.length || !mounted) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      
      // Prüfen, ob die Maus im Chart-Bereich ist
      if (mouseX < padding.left || mouseX > (padding.left + chartWidth)) {
        showTooltip = false;
        hoverIndex = null;
        drawChart();
        return;
      }
      
      // Relativen X-Wert berechnen (0 bis 1)
      const relativeX = (mouseX - padding.left) / chartWidth;
      
      // Nächsten Datenpunkt finden
      const dataIndex = Math.round(relativeX * (chartData.length - 1));
      
      if (dataIndex >= 0 && dataIndex < chartData.length) {
        hoverIndex = dataIndex;
        
        // Positionsberechnung für den Tooltip
        const dataPoint = chartData[dataIndex];
        const pointY = padding.top + chartHeight - ((dataPoint.price - Math.min(...chartData.map(d => d.price))) / 
                  (Math.max(...chartData.map(d => d.price)) - Math.min(...chartData.map(d => d.price)))) * chartHeight;
        
        // Tooltip-Informationen aktualisieren
        tooltipX = mouseX;
        tooltipY = pointY;
        tooltipPrice = dataPoint.price;
        tooltipDate = formatFullDateTime(dataPoint.timestamp);
        
        showTooltip = true;
        drawChart(dataIndex);
      }
    }
    
    function handleMouseLeave() {
      showTooltip = false;
      hoverIndex = null;
      drawChart();
    }
    
    async function fetchChartData() {
      // Keine Anfrage senden, wenn die Komponente nicht mehr mounted ist
      if (!mounted) return;
      
      // Kein erneutes Laden, wenn der Timeframe gleich ist
      if (timeframe === lastTimeframe && chartData.length > 0) return;
      
      lastTimeframe = timeframe;
      isLoading = true;
      errorMessage = null;
      
      try {
        // Vereinfachter Endpunkt verwenden
        const url = `/api/simple-chart?symbol=${symbol.toLowerCase()}&days=${timeframe === '1d' ? '1' : 
                                                                           timeframe === '7d' ? '7' : 
                                                                           timeframe === '30d' ? '30' : 
                                                                           '90'}`;
        
        const response = await fetch(url);
        const responseData = await response.json();
        
        // Keine Verarbeitung, wenn die Komponente nicht mehr mounted ist
        if (!mounted) return;
        
        // Daten aufbereiten
        chartData = responseData.data.prices.map(item => ({
          timestamp: item[0],
          price: item[1]
        }));
        
        // Wenn simulierte Daten verwendet wurden
        if (responseData.isMock) {
          useMockData = true;
          errorMessage = responseData.error || 'API-Limit erreicht. Es werden Beispieldaten angezeigt.';
        } else {
          useMockData = false;
        }
        
        // Warten bis der nächste Frame gerendert wurde
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Keine Verarbeitung, wenn die Komponente nicht mehr mounted ist
        if (!mounted) return;
        
        drawChart();
      } catch (err) {
        console.error('Fehler beim Laden der Chart-Daten:', err);
        errorMessage = err.message || 'Fehler beim Laden der Chart-Daten';
      } finally {
        isLoading = false;
      }
    }
    
    // Nur Chart aktualisieren, wenn sich der Timeframe ändert und die Komponente bereits geladen ist
    $: {
      if (mounted && timeframe !== lastTimeframe) {
        fetchChartData();
      }
    }
    
    // Fenstergrößenänderungen behandeln
    function handleResize() {
      if (canvas && chartData.length > 0 && mounted) {
        drawChart(hoverIndex);
      }
    }
    
    onMount(() => {
      mounted = true;
      window.addEventListener('resize', handleResize);
      
      // Event-Listener für Mausbewegungen hinzufügen
      if (canvas) {
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
      }
      
      fetchChartData();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (canvas) {
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    });
    
    onDestroy(() => {
      mounted = false;
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
      </div>
    </div>
    
    <div class="chart-content" bind:this={canvasContainer}>
      {#if isLoading && chartData.length === 0}
        <div class="loading">Lade Kursdaten...</div>
      {:else if errorMessage}
        <div class="warning">
          <p>{errorMessage}</p>
          {#if useMockData}
            <p class="text-sm">Es werden simulierte Daten angezeigt.</p>
          {/if}
        </div>
      {/if}
      
      <canvas bind:this={canvas} width="800" height="400"></canvas>
      
      <!-- Tooltip für Hover-Funktion -->
      {#if showTooltip && hoverIndex !== null}
        <div 
          class="tooltip" 
          style="left: {tooltipX}px; top: {tooltipY - 60}px;"
        >
          <div class="tooltip-date">{tooltipDate}</div>
          <div class="tooltip-price">{formatCurrency(tooltipPrice)}</div>
        </div>
      {/if}
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
      cursor: crosshair;
    }
    
    .loading, .warning {
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
    
    .warning {
      color: #f59e0b;
      background-color: rgba(255, 251, 235, 0.9);
    }
    
    .tooltip {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.75);
      color: white;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 12px;
      pointer-events: none;
      z-index: 20;
      transform: translateX(-50%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      min-width: 120px;
      text-align: center;
    }
    
    .tooltip:after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgba(0, 0, 0, 0.75);
    }
    
    .tooltip-date {
      font-size: 11px;
      color: #bbbbbb;
      margin-bottom: 2px;
    }
    
    .tooltip-price {
      font-weight: bold;
      font-size: 14px;
    }
  </style>