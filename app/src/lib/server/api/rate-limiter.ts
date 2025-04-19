// src/lib/server/api/rate-limiter.ts
/**
 * Einfacher Rate-Limiter für API-Anfragen
 * Verhindert zu viele Anfragen in kurzer Zeit
 */

class RateLimiter {
    private lastCallTime: number = 0;
    private minIntervalMs: number = 6000; // 6 Sekunden zwischen Anfragen
    private defaultBackoffMs: number = 30000; // 30 Sekunden Wartezeit nach einem 429-Fehler
    private backoffTimeMs: number = 0; // Dynamische Backoff-Zeit
    
    /**
     * Wartet die erforderliche Zeit zwischen API-Anfragen
     */
    async throttle(): Promise<void> {
      const now = Date.now();
      
      // Wenn wir uns in einem Backoff-Zustand befinden
      if (this.backoffTimeMs > 0) {
        const timeSinceLastCall = now - this.lastCallTime;
        
        if (timeSinceLastCall < this.backoffTimeMs) {
          // Wir müssen noch warten
          const waitTime = this.backoffTimeMs - timeSinceLastCall;
          console.log(`Rate-Limit-Backoff: Warte ${waitTime}ms vor der nächsten Anfrage...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Nach dem Warten Backoff reduzieren
          this.backoffTimeMs = Math.max(this.minIntervalMs, this.backoffTimeMs / 2);
        } else {
          // Backoff-Zeit ist abgelaufen, zurück zum normalen Intervall
          this.backoffTimeMs = this.minIntervalMs;
        }
      } else {
        // Normale Drosselung
        const timeSinceLastCall = now - this.lastCallTime;
        
        if (timeSinceLastCall < this.minIntervalMs) {
          const waitTime = this.minIntervalMs - timeSinceLastCall;
          console.log(`Rate-Limiting: Warte ${waitTime}ms vor der nächsten Anfrage...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      // Aktuelle Zeit als letzte Anfragezeit speichern
      this.lastCallTime = Date.now();
    }
    
    /**
     * Wird aufgerufen, wenn ein Rate-Limit-Fehler (429) auftritt
     * @param customBackoffMs Optionale benutzerdefinierte Backoff-Zeit
     */
    handleRateLimitExceeded(customBackoffMs?: number): void {
      // Backoff-Zeit erhöhen
      this.backoffTimeMs = customBackoffMs || this.defaultBackoffMs;
      console.log(`Rate-Limit überschritten! Erhöhe Backoff-Zeit auf ${this.backoffTimeMs}ms`);
    }
  }
  
  // Singleton-Instanz für die gesamte Anwendung exportieren
  export const rateLimiter = new RateLimiter();