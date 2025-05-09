<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
	<base href="/" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-gray-50">
	<Navbar />

	<main class="flex-grow">
		<slot />
	</main>

	<footer class="bg-white py-6">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<p class="text-center text-sm text-gray-500">
				&copy; {new Date().getFullYear()} DHBWallet - Projekt im 4. Semester von Florentin Röseler für
				das Fach Einsatz von Webtechnologien
			</p>
		</div>
	</footer>
</div>
