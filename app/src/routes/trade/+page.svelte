<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	// Formatierungsfunktionen
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(amount);
	};

	const formatCryptoAmount = (amount: number): string => {
		if (amount === 0) return '0';

		// Für sehr kleine Beträge wissenschaftliche Notation vermeiden
		if (amount < 0.000001) {
			return amount.toFixed(10).replace(/\.?0+$/, '');
		}

		return amount.toFixed(6).replace(/\.?0+$/, '');
	};

	// Sortier- und Filterfunktionen
	let searchTerm = '';
	let sortColumn = 'name';
	let sortDirection = 'asc';

	$: filteredCryptos = data.cryptos
		.filter(
			(crypto) =>
				crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => {
			const factor = sortDirection === 'asc' ? 1 : -1;

			switch (sortColumn) {
				case 'name':
					return factor * a.name.localeCompare(b.name);
				case 'symbol':
					return factor * a.symbol.localeCompare(b.symbol);
				case 'price':
					return factor * (a.currentPrice - b.currentPrice);
				case 'balance':
					return factor * (a.userBalance - b.userBalance);
				default:
					return 0;
			}
		});

	function handleSort(column: string) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	function handleRowClick(assetId: string) {
		goto(`/trade/${assetId}`);
	}
</script>

<svelte:head>
	<title>Trading | DHBWallet</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mb-6 md:flex md:items-center md:justify-between">
			<div class="min-w-0 flex-1">
				<h1 class="text-2xl font-bold leading-normal text-gray-900 sm:truncate sm:text-3xl">
					Kryptowährungen handeln
				</h1>
				<p class="mt-1 text-sm text-gray-500">
					Wähle eine Kryptowährung aus, um mit dem Handeln zu beginnen. Dein verfügbares Guthaben: <strong
						>{formatCurrency(data.user.balance)}</strong
					>
				</p>
			</div>
		</div>

		<!-- Suchfeld und Filter -->
		<div class="mb-6 rounded-lg bg-white p-4 shadow">
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div class="w-full md:w-64">
					<label for="search" class="sr-only">Suche</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 text-gray-400"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<input
							id="search"
							bind:value={searchTerm}
							class="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
							placeholder="Nach Name oder Symbol suchen"
							type="search"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Kryptowährungstabelle -->
		<div class="overflow-hidden rounded-lg bg-white shadow">
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								on:click={() => handleSort('name')}
							>
								<div class="flex items-center">
									Kryptowährung
									{#if sortColumn === 'name'}
										<svg
											class="ml-1 h-4 w-4 text-gray-400"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											{#if sortDirection === 'asc'}
												<path
													fill-rule="evenodd"
													d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
													clip-rule="evenodd"
												/>
											{:else}
												<path
													fill-rule="evenodd"
													d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											{/if}
										</svg>
									{/if}
								</div>
							</th>
							<th
								scope="col"
								class="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								on:click={() => handleSort('symbol')}
							>
								<div class="flex items-center">
									Symbol
									{#if sortColumn === 'symbol'}
										<svg
											class="ml-1 h-4 w-4 text-gray-400"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											{#if sortDirection === 'asc'}
												<path
													fill-rule="evenodd"
													d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
													clip-rule="evenodd"
												/>
											{:else}
												<path
													fill-rule="evenodd"
													d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											{/if}
										</svg>
									{/if}
								</div>
							</th>
							<th
								scope="col"
								class="cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
								on:click={() => handleSort('price')}
							>
								<div class="flex items-center justify-end">
									Aktueller Preis
									{#if sortColumn === 'price'}
										<svg
											class="ml-1 h-4 w-4 text-gray-400"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											{#if sortDirection === 'asc'}
												<path
													fill-rule="evenodd"
													d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
													clip-rule="evenodd"
												/>
											{:else}
												<path
													fill-rule="evenodd"
													d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											{/if}
										</svg>
									{/if}
								</div>
							</th>
							<th
								scope="col"
								class="cursor-pointer px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
								on:click={() => handleSort('balance')}
							>
								<div class="flex items-center justify-end">
									Dein Bestand
									{#if sortColumn === 'balance'}
										<svg
											class="ml-1 h-4 w-4 text-gray-400"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											{#if sortDirection === 'asc'}
												<path
													fill-rule="evenodd"
													d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
													clip-rule="evenodd"
												/>
											{:else}
												<path
													fill-rule="evenodd"
													d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
													clip-rule="evenodd"
												/>
											{/if}
										</svg>
									{/if}
								</div>
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
							>
								Aktion
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#if filteredCryptos.length === 0}
							<tr>
								<td colspan="5" class="px-6 py-8 text-center text-gray-500">
									{searchTerm
										? 'Keine Kryptowährungen gefunden. Versuche einen anderen Suchbegriff.'
										: 'Keine Kryptowährungen verfügbar.'}
								</td>
							</tr>
						{:else}
							{#each filteredCryptos as crypto}
								<tr
									class="cursor-pointer hover:bg-gray-50"
									on:click={() => handleRowClick(crypto.id)}
								>
									<td class="whitespace-nowrap px-6 py-4">
										<div class="flex items-center">
											{#if crypto.imageUrl}
												<div class="h-10 w-10 flex-shrink-0">
													<img
														class="h-10 w-10 rounded-full"
														src={crypto.imageUrl}
														alt={crypto.name}
													/>
												</div>
											{:else}
												<div
													class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"
												>
													<span class="font-bold text-gray-500"
														>{crypto.symbol.substring(0, 2)}</span
													>
												</div>
											{/if}
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">{crypto.name}</div>
											</div>
										</div>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
										{crypto.symbol}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
										{formatCurrency(crypto.currentPrice)}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
										{formatCryptoAmount(crypto.userBalance)}
										{crypto.symbol}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
										<a
											href={`/trade/${crypto.id}`}
											class="text-blue-600 hover:text-blue-900"
											on:click|stopPropagation
										>
											Handeln
										</a>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>