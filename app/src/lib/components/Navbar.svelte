<script>
	import { page } from '$app/stores';
	import { onMount, afterUpdate } from 'svelte';
	import UserSearch from './social/UserSearch.svelte';
	import { browser } from '$app/environment';

	// Benutzer ist dynamisch
	$: isLoggedIn = !!$page.data.user;
	$: user = $page.data.user;

	// Variable für das mobile Menü
	let isMobileMenuOpen = false;

	// Funktion zum Umschalten des mobilen Menüs
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
</script>

<nav class="bg-white shadow">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between">
			<div class="flex items-center">
				<div class="flex flex-shrink-0 items-center">
					<!-- Logo -->
					<a href="/" class="flex items-center">
						<img src="/images/logo_ohne_text.png" alt="DHBWallet Logo" class="h-14 w-auto" />
					</a>
				</div>
				<!-- Desktop-Navigation -->
				<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
					<a
						href="/"
						class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Home
					</a>
					<a
						href="/trade"
						class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Coins
					</a>
					<a
						href="/leaderboard"
						class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Leaderboard
					</a>
				</div>
			</div>

			<!-- Suchfeld (Desktop) -->
			<div class="mx-4 hidden flex-1 md:flex md:items-center md:justify-center">
				<div class="w-full max-w-xs">
					<UserSearch />
				</div>
			</div>

			<!-- Benutzeraktionen (Desktop) -->
			<div class="hidden sm:flex sm:items-center">
				{#if isLoggedIn}
					<a
						href="/dashboard"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Dashboard
					</a>

					<!-- Username -->
					<div class="group relative ml-3">
						<a href="/profile/{user.username}" class="flex items-center">
							<span class="text-sm font-medium text-gray-700 group-hover:text-blue-600">
								{user.username}
							</span>
						</a>
					</div>

					<a
						href="/logout"
						class="ml-3 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
					>
						Abmelden
					</a>
				{:else}
					<a
						href="/login"
						class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
					>
						Anmelden
					</a>
					<a
						href="/register"
						class="ml-3 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						Registrieren
					</a>
				{/if}
			</div>

			<!-- Mobile-Menü-Button -->
			<div class="flex items-center sm:hidden">
				<button
					type="button"
					on:click={toggleMobileMenu}
					class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
					aria-expanded={isMobileMenuOpen}
				>
					<span class="sr-only">Menü öffnen</span>
					<!-- Hamburger-Icon -->
					<svg
						class={isMobileMenuOpen ? 'hidden' : 'block'}
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
						width="24"
						height="24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
					<!-- X-Icon -->
					<svg
						class={isMobileMenuOpen ? 'block' : 'hidden'}
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
						width="24"
						height="24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile-Ansicht für die Suche -->
	<div class="px-4 pb-3 md:hidden">
		<UserSearch />
	</div>

	<!-- Mobile-Menü -->
	{#if isMobileMenuOpen}
		<div class="sm:hidden">
			<div class="space-y-1 border-t border-gray-200 pb-3 pt-2">
				<a href="/" class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700">
					Home
				</a>
				<a
					href="/trade"
					class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
				>
					Coins
				</a>
				<a
					href="/leaderboard"
					class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
				>
					Leaderboard
				</a>
				{#if isLoggedIn}
					<a
						href="/dashboard"
						class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
					>
						Dashboard
					</a>
					<a
						href="/profile/{user.username}"
						class="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
					>
						Profil: {user.username}
					</a>
					<a
						href="/logout"
						class="mt-1 block bg-red-600 px-3 py-2 text-base font-medium text-white hover:bg-red-700"
					>
						Abmelden
					</a>
				{:else}
					<div class="flex flex-col space-y-2 px-3 py-2">
						<a
							href="/login"
							class="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
						>
							Anmelden
						</a>
						<a
							href="/register"
							class="block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
						>
							Registrieren
						</a>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</nav>
