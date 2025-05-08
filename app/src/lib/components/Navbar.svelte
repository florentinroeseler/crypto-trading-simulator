<!-- src/lib/components/Navbar.svelte -->
<script>
  import { page } from '$app/stores';
  import { onMount, afterUpdate } from 'svelte';
  import UserSearch from './social/UserSearch.svelte';
  import { browser } from '$app/environment';
  
  // Benutzer ist nun dynamisch, nicht mehr hartcodiert
  $: isLoggedIn = !!$page.data.user;
  $: user = $page.data.user;
</script>

<!-- Rest des Codes bleibt unverändert -->

<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="text-xl font-bold text-blue-600">
            DHBWallet
          </a>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          <a 
            href="/" 
            class="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
          >
            Home
          </a>
          <a 
            href="/trade" 
            class="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
          >
            Coins
          </a>
          <a 
            href="/leaderboard" 
            class="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
          >
            Leaderboard
          </a>
        </div>
      </div>

      <!-- Suchfeld in der Mitte positionieren -->
      <div class="hidden md:flex md:items-center md:justify-center flex-1 mx-4">
        <div class="w-full max-w-xs">
          <UserSearch />
        </div>
      </div>
      
      <div class="hidden sm:flex sm:items-center">
        {#if isLoggedIn}
          <a 
            href="/dashboard" 
            class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </a>
          
          <!-- Nur Username anzeigen -->
          <div class="ml-3 relative group">
            <a href="/profile/{user.username}" class="flex items-center">
              <span class="text-gray-700 text-sm font-medium group-hover:text-blue-600">
                {user.username}
              </span>
            </a>
          </div>
          
          <a 
            href="/logout" 
            class="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium ml-3"
          >
            Abmelden
          </a>
        {:else}
          <a 
            href="/login" 
            class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Anmelden
          </a>
          <a 
            href="/register" 
            class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium ml-3"
          >
            Registrieren
          </a>
        {/if}
      </div>
    </div>
  </div>

  <!-- Mobile-Ansicht für die Suche -->
  <div class="md:hidden px-4 pb-3">
    <UserSearch />
  </div>
</nav>