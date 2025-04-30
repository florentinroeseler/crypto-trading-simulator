<!-- src/lib/components/social/UserSearch.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    let searchTerm = '';
    let searchResults = [];
    let loading = false;
    let debounceTimer: ReturnType<typeof setTimeout>;
  
    async function searchUsers() {
      if (!searchTerm || searchTerm.length < 2) {
        searchResults = [];
        return;
      }
      
      loading = true;
      
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          searchResults = await response.json();
        } else {
          console.error('Fehler bei der Benutzersuche');
          searchResults = [];
        }
      } catch (error) {
        console.error('Fehler bei der Benutzersuche:', error);
        searchResults = [];
      } finally {
        loading = false;
      }
    }
    
    function handleSearch() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchUsers();
      }, 300);
    }
    
    function viewProfile(username) {
      goto(`/profile/${username}`);
      searchTerm = '';
      searchResults = [];
    }
  </script>
  
  <div class="relative">
    <div class="relative">
      <input
        type="text"
        bind:value={searchTerm}
        on:input={handleSearch}
        placeholder="Benutzer suchen..."
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {#if loading}
        <div class="absolute right-3 top-2.5">
          <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      {/if}
    </div>
    
    {#if searchResults.length > 0}
      <div class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
        <ul class="py-1">
          {#each searchResults as user}
            <li>
              <button
                on:click={() => viewProfile(user.username)}
                class="flex items-center px-4 py-2 w-full text-left hover:bg-gray-100"
              >
                <div class="flex-shrink-0">
                  <img
                    src={user.profileImageUrl || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
                    alt={user.username}
                    class="h-8 w-8 rounded-full"
                  />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{user.username}</p>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>