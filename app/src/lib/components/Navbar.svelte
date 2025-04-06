<!-- src/lib/components/Navbar.svelte -->
<script>
  // Importiere den Benutzer aus dem Seitendatenkontext
  import { page } from '$app/stores';
  
  // Benutzer ist nun dynamisch, nicht mehr hartcodiert
  $: isLoggedIn = !!$page.data.user;
  $: user = $page.data.user;
</script>

<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <a href="/" class="text-xl font-bold text-blue-600">
            Crypto Trading Simulator
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
            href="/cryptos" 
            class="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
          >
            Kryptowährungen
          </a>
        </div>
      </div>
      <div class="hidden sm:ml-6 sm:flex sm:items-center">
        {#if isLoggedIn}
          <a 
            href="/dashboard" 
            class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </a>
          <span class="text-gray-500 px-3 py-2 text-sm">
            {user.username}
          </span>
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
</nav>