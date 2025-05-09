<script>
	import { enhance } from '$app/forms';
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-white p-8 text-center shadow-md">
			<h1 class="mb-4 text-2xl font-bold text-gray-900">Abmelden</h1>
			<p class="mb-6 text-gray-600">Bist du sicher, dass du dich abmelden möchtest?</p>

			<form method="POST" use:enhance>
				<div class="flex justify-center gap-4">
					<a
						href="/"
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
					>
						Abbrechen
					</a>
					<button
						type="submit"
						class="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
					>
						Abmelden
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
