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
	let localError = '';

	function validateForm() {
		return (
			password === confirmPassword &&
			password.length >= 8 &&
			username.length >= 3 &&
			email.includes('@')
		);
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
	<div class="w-full max-w-md">
		<div class="mx-auto mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Registrieren</h1>
			<p class="mt-2 text-sm text-gray-600">
				Oder <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
					melde dich an, wenn du bereits ein Konto hast
				</a>
			</p>
		</div>

		<div class="rounded-lg bg-white p-8 shadow-md">
			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					localError = ''; // Fehler zurücksetzen

					return async ({ result }) => {
						isLoading = false;
						console.log('Form result:', result);

						if (result.type === 'success' && result.data?.success) {
							window.location.href = '/dashboard';
						} else if (result.type === 'failure') {
							// Fehler aus der Antwort extrahieren und lokal speichern
							if (result.data?.error) {
								localError = result.data.error;
							} else {
								localError = 'Ein unbekannter Fehler ist aufgetreten';
							}
						}
					};
				}}
			>
				{#if form?.error || localError}
					<div class="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
						{form?.error || localError}
					</div>
				{/if}

				<div class="mb-4">
					<label for="username" class="mb-1 block text-sm font-medium text-gray-700">
						Benutzername
					</label>
					<input
						type="text"
						id="username"
						name="username"
						bind:value={username}
						required
						minlength="3"
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					/>
				</div>

				<div class="mb-4">
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> E-Mail </label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={email}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					/>
				</div>

				<div class="mb-4">
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
						Passwort
					</label>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						required
						minlength="8"
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					/>
					<p class="mt-1 text-xs text-gray-500">Mindestens 8 Zeichen</p>
				</div>

				<div class="mb-6">
					<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">
						Passwort bestätigen
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					/>
					{#if confirmPassword && password !== confirmPassword}
						<p class="mt-1 text-xs text-red-600">Passwörter stimmen nicht überein</p>
					{/if}
				</div>

				<button
					type="submit"
					disabled={!validateForm() || isLoading}
					class="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? 'Wird verarbeitet...' : 'Registrieren'}
				</button>
			</form>
		</div>
	</div>
</div>
