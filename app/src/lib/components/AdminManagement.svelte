<!-- src/lib/components/AdminManagement.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    export let isAdmin = false;
    let username = '';
    let adminState = true;
    let statusMessage = '';
    let statusSuccess = false;
    let masterKey = '';
    let showMasterKey = false;
    
    // Prüfen, ob ein Nutzer Admin ist
    async function toggleAdminStatus() {
      try {
        statusMessage = 'Verarbeite Anfrage...';
        
        const response = await fetch('/api/admin/toggle-admin-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username,
            adminState,
            masterKey: showMasterKey ? masterKey : undefined
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          statusSuccess = true;
          statusMessage = data.message;
          username = ''; // Formular zurücksetzen
        } else {
          statusSuccess = false;
          statusMessage = `Fehler: ${data.message}`;
        }
      } catch (error) {
        statusSuccess = false;
        statusMessage = `Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`;
      }
      
      // Status-Nachricht nach 5 Sekunden ausblenden
      setTimeout(() => {
        statusMessage = '';
      }, 5000);
    }
  </script>
  
  {#if isAdmin}
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-bold mb-4">Admin-Verwaltung</h2>
      
      <form on:submit|preventDefault={toggleAdminStatus} class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            Benutzername
          </label>
          <input 
            type="text" 
            id="username" 
            bind:value={username} 
            required
            placeholder="Benutzername des zu ändernden Nutzers"
            class="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label for="adminState" class="block text-sm font-medium text-gray-700 mb-1">
            Admin-Status
          </label>
          <select 
            id="adminState" 
            bind:value={adminState}
            class="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={true}>Admin-Rechte aktivieren</option>
            <option value={false}>Admin-Rechte deaktivieren</option>
          </select>
        </div>
        
        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="showMasterKey" 
            bind:checked={showMasterKey} 
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="showMasterKey" class="ml-2 block text-sm text-gray-700">
            Master-Key verwenden (nur für Ersteinrichtung)
          </label>
        </div>
        
        {#if showMasterKey}
          <div>
            <label for="masterKey" class="block text-sm font-medium text-gray-700 mb-1">
              Master-Key
            </label>
            <input 
              type="password" 
              id="masterKey" 
              bind:value={masterKey} 
              placeholder="Nur für die Ersteinrichtung des ersten Admins"
              class="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              Der Master-Key wird nur benötigt, wenn noch kein Admin im System existiert.
            </p>
          </div>
        {/if}
        
        {#if statusMessage}
          <div class={`p-3 rounded text-sm ${statusSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {statusMessage}
          </div>
        {/if}
        
        <button 
          type="submit" 
          class="bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Admin-Status ändern
        </button>
      </form>
      
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Anleitung zur Admin-Verwaltung</h3>
        <div class="text-sm text-gray-600 space-y-2">
          <p>Als Administrator kannst du anderen Nutzern Admin-Rechte gewähren oder entziehen.</p>
          <p><strong>Für den ersten Admin:</strong> Verwende den Master-Key, der in der API-Datei definiert ist.</p>
          <p><strong>Für weitere Admins:</strong> Gib einfach den Benutzernamen ein und wähle den gewünschten Status.</p>
        </div>
      </div>
    </div>
  {/if}