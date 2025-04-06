<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { ActionData } from './$types';
    
    export let form: ActionData;
    
    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let isLoading = false;
    
    function validateForm() {
      return password === confirmPassword && 
             password.length >= 8 && 
             username.length >= 3 &&
             email.includes('@');
    }
  </script>
  
  <div class="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gray-50">
    <div class="w-full max-w-md">
      <div class="mx-auto text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Registrieren</h1>
        <p class="mt-2 text-sm text-gray-600">
          Oder <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
            melde dich an, wenn du bereits ein Konto hast
          </a>
        </p>
      </div>
      
      <div class="bg-white p-8 shadow-md rounded-lg">
        <form method="POST" use:enhance={() => {
          isLoading = true;
          return async ({ result }) => {
            isLoading = false;
        
            // Hier prüfen wir, ob die Aktion erfolgreich war
            if (result.type === 'success' && result.data?.success) {
              // Vollständige Seitenaktualisierung anstelle von goto
              window.location.href = '/dashboard';
            }
          };
        }}>
        {#if form?.error}
            <div class="mb-4 p-4 text-sm rounded-md bg-red-50 text-red-600">
            {form.error}
            </div>
        {/if}
          
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Benutzername
            </label>
            <input
              type="text"
              id="username"
              name="username"
              bind:value={username}
              required
              minlength="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              bind:value={email}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input
              type="password"
              id="password"
              name="password"
              bind:value={password}
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">
              Mindestens 8 Zeichen
            </p>
          </div>
          
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen
            </label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {#if confirmPassword && password !== confirmPassword}
              <p class="mt-1 text-xs text-red-600">
                Passwörter stimmen nicht überein
              </p>
            {/if}
          </div>
          
          <button
            type="submit"
            disabled={!validateForm() || isLoading}
            class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Wird verarbeitet...' : 'Registrieren'}
          </button>
        </form>
      </div>
    </div>
  </div>