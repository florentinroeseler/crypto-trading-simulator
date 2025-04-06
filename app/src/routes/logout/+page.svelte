<!-- src/routes/logout/+page.svelte -->
<script>
    import { enhance } from '$app/forms';
  </script>
  
  <div class="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gray-50">
    <div class="w-full max-w-md">
      <div class="bg-white p-8 shadow-md rounded-lg text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Abmelden</h1>
        <p class="mb-6 text-gray-600">
          Bist du sicher, dass du dich abmelden möchtest?
        </p>
        
        <form method="POST" use:enhance>
          <div class="flex justify-center gap-4">
            <a 
              href="/" 
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Abbrechen
            </a>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Abmelden
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>