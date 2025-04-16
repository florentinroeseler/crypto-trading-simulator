<svelte:head>
  <base href="/" />
</svelte:head>

<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
</script>
  
  <div class="min-h-screen bg-gray-50 flex flex-col">
	<Navbar />
	
	<main class="flex-grow">
	  <slot />
	</main>
	
	<footer class="bg-white py-6">
	  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<p class="text-center text-sm text-gray-500">
		  &copy; {new Date().getFullYear()} Crypto Trading Simulator - Uni-Projekt
		</p>
	  </div>
	</footer>
  </div>