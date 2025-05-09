<script lang="ts">
	import type { PageData } from './$types';
	import PortfolioChart from '$lib/components/PortfolioChart.svelte';

	export let data: PageData;

	// Formatierung für Währungen, Prozentsätze und Daten
	const formatCurrency = (amount: number): string => {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(amount);
	};

	const formatPercent = (value: number): string => {
		return new Intl.NumberFormat('de-DE', {
			style: 'percent',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value / 100);
	};

	const formatDate = (dateInput: string | Date): string => {
		const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
		return new Intl.DateTimeFormat('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};

	// Legt Farbe basierend auf Gewinn/Verlust fest
	const getProfitLossClass = (value: number): string => {
		return value >= 0 ? 'text-green-600' : 'text-red-600';
	};

	// Portfolio Daten
	const portfolioValue = data.portfolio?.totalValue || 0;
	const totalAssets = portfolioValue + data.user.balance;
	const cashPercentage = (data.user.balance / Math.max(totalAssets, 1)) * 100;
	const investedPercentage = (portfolioValue / Math.max(totalAssets, 1)) * 100;

	// Prüfen, ob Portfolio-Daten existieren
	const hasPortfolioData = data.portfolio?.items?.length > 0;
	const hasTransactionData = data?.recentTransactions?.length > 0;
</script>

<svelte:head>
	<title>Dashboard | DHBWallet</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Übersichtskarten -->
		<div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Gesamtvermögen -->
			<div class="rounded-lg bg-white p-6 shadow">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-medium text-gray-500">Gesamtvermögen</h2>
					{#if data.portfolio?.totalProfitLoss}
						<div class="flex items-center gap-1">
							<span class={data.portfolio.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
								{formatPercent(data.portfolio.profitLossPercentage || 0)}
							</span>
							<svg
								class={`h-4 w-4 ${data.portfolio.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								{#if data.portfolio.totalProfitLoss >= 0}
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
										clip-rule="evenodd"
									/>
								{:else}
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
										clip-rule="evenodd"
									/>
								{/if}
							</svg>
						</div>
					{/if}
				</div>
				<div class="mt-2">
					<p class="text-3xl font-bold text-gray-900">{formatCurrency(totalAssets)}</p>
					{#if data.portfolio?.totalProfitLoss}
						<p class="mt-1 text-sm text-gray-500">
							Gewinn/Verlust:
							<span class={getProfitLossClass(data.portfolio.totalProfitLoss)}>
								{formatCurrency(data.portfolio.totalProfitLoss)}
							</span>
						</p>
					{/if}
				</div>
			</div>

			<!-- Verfügbar -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="text-sm font-medium text-gray-500">Verfügbares Guthaben</h2>
				<div class="mt-2">
					<p class="text-3xl font-bold text-gray-900">{formatCurrency(data.user.balance)}</p>
					<p class="mt-1 text-sm text-gray-500">
						{formatPercent(cashPercentage)} deines Gesamtvermögens
					</p>
				</div>
			</div>

			<!-- Investiert -->
			<div class="rounded-lg bg-white p-6 shadow">
				<h2 class="text-sm font-medium text-gray-500">Investiertes Vermögen</h2>
				<div class="mt-2">
					<p class="text-3xl font-bold text-gray-900">{formatCurrency(portfolioValue)}</p>
					<p class="mt-1 text-sm text-gray-500">
						{formatPercent(investedPercentage)} deines Gesamtvermögens
					</p>
				</div>
			</div>
		</div>

		<!-- Portfolio-Chart -->
		<div class="mb-6 rounded-lg bg-white shadow">
			<div class="p-6">
				<!-- Hier kommt die neue PortfolioChart-Komponente -->
				<PortfolioChart balance={data.user.balance} color="#3B82F6" />
			</div>
		</div>

		<!-- Portfolio-Übersicht -->
		<div class="mb-6 rounded-lg bg-white shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium text-gray-900">Deine Anlagen</h2>

				{#if !hasPortfolioData}
					<div class="rounded-lg bg-gray-50 p-6 text-center">
						<p class="text-gray-600">Du hast noch keine Kryptowährungen in deinem Portfolio.</p>
						<a
							href="/trade"
							class="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
							Starte mit deinem ersten Trade
						</a>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead>
								<tr>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
										>Asset</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Bestand</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Ø Kaufpreis</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Aktueller Preis</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Wert</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Gewinn/Verlust</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Aktionen</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each data.portfolio?.items || [] as item}
									<tr class="hover:bg-gray-50">
										<td class="whitespace-nowrap px-6 py-4">
											<div class="flex items-center">
												{#if item.imageUrl}
													<div class="h-10 w-10 flex-shrink-0">
														<img
															class="h-10 w-10 rounded-full"
															src={item.imageUrl}
															alt={item.name}
														/>
													</div>
												{:else}
													<div
														class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200"
													>
														<span class="font-bold text-gray-500"
															>{item.symbol.substring(0, 2)}</span
														>
													</div>
												{/if}
												<div class="ml-4">
													<div class="text-sm font-medium text-gray-900">{item.name}</div>
													<div class="text-sm text-gray-500">{item.symbol}</div>
												</div>
											</div>
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{item.quantity.toFixed(6)}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{formatCurrency(item.averageBuyPrice)}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{formatCurrency(item.currentPrice)}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{formatCurrency(Number(item.value))}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right">
											<div class={getProfitLossClass(Number(item.profitLoss))}>
												{formatCurrency(Number(item.profitLoss))}
												<span class="ml-1 text-xs"
													>({formatPercent(Number(item.profitLossPercentage))})</span
												>
											</div>
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
											<a href={`/trade/${item.assetId}`} class="text-blue-600 hover:text-blue-900"
												>Handeln</a
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>

		<!-- Letzte Transaktionen -->
		<div class="rounded-lg bg-white shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium text-gray-900">Letzte Transaktionen</h2>

				{#if !hasTransactionData}
					<div class="rounded-lg bg-gray-50 p-6 text-center">
						<p class="text-gray-600">Du hast noch keine Transaktionen durchgeführt.</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="min-w-full divide-y divide-gray-200">
							<thead>
								<tr>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
										>Datum</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
										>Typ</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
										>Asset</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Menge</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Preis</th
									>
									<th
										scope="col"
										class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
										>Gesamt</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-200 bg-white">
								{#each data.recentTransactions || [] as transaction}
									<tr class="hover:bg-gray-50">
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
											{formatDate(transaction.timestamp)}
										</td>
										<td class="whitespace-nowrap px-6 py-4">
											<span
												class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
											>
												{transaction.type === 'buy' ? 'Kauf' : 'Verkauf'}
											</span>
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
											{transaction.name} ({transaction.symbol})
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{transaction.quantity.toFixed(6)}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{formatCurrency(transaction.price)}
										</td>
										<td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
											{formatCurrency(transaction.total)}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>

						<div class="mt-4 text-right">
							<a href="/transactions" class="text-sm text-blue-600 hover:text-blue-900">
								Alle Transaktionen anzeigen →
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
