<script lang="ts">
	import type { PageData } from './$types';
	import PortfolioChart from '$lib/components/PortfolioChart.svelte';

	export let data: PageData;

	// Formatierung für Währungs-, Prozent- und Datumsangaben
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
			year: 'numeric'
		}).format(date);
	};

	// Hilfsfunktion zur Bestimmung der Farbe basierend auf Gewinn/Verlust
	const getProfitLossClass = (value: number): string => {
		return value >= 0 ? 'text-green-600' : 'text-red-600';
	};

	// Überprüfen, ob Portfolio- und Transaktionsdaten vorhanden sind
	const hasPortfolioData = data.canViewPortfolio && data.portfolio?.items?.length > 0;
	const hasTransactionData = data.canViewPortfolio && data?.recentTransactions?.length > 0;

	// Default profile image
	const defaultProfileImage =
		'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
	const profileImage = data.profileUser.profileImageUrl || defaultProfileImage;
</script>

<svelte:head>
	<title>{data.profileUser.username} | DHBWallet</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Profilheader -->
		<div class="mb-6 rounded-lg bg-white shadow">
			<div class="p-6">
				<div class="flex flex-col items-center md:flex-row">
					<div class="mb-4 flex-shrink-0 md:mb-0">
						<img
							class="h-32 w-32 rounded-full object-cover"
							src={profileImage}
							alt={data.profileUser.username}
						/>
					</div>
					<div class="text-center md:ml-6 md:text-left">
						<h1 class="text-2xl font-bold text-gray-900">{data.profileUser.username}</h1>
						{#if data.profileUser.bio}
							<p class="mt-1 max-w-2xl text-gray-600">{data.profileUser.bio}</p>
						{/if}
						<p class="mt-2 text-sm text-gray-500">
							Mitglied seit {formatDate(data.profileUser.createdAt)}
						</p>

						{#if data.isOwner}
							<div class="mt-3">
								<a
									href="/profile/edit"
									class="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								>
									Profil bearbeiten
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		{#if !data.canViewPortfolio}
			<div class="mb-6 rounded-lg bg-white p-6 text-center shadow">
				<p class="text-gray-600">
					{data.profileUser.username} hat sein Portfolio als privat gekennzeichnet.
				</p>
			</div>
		{:else}
			<!-- Portfolio Performance -->
			{#if hasPortfolioData}
				<div class="mb-6 rounded-lg bg-white shadow">
					<div class="p-6">
						<h2 class="mb-4 text-lg font-medium text-gray-900">Portfolio Performance</h2>
						<div class="mb-4 flex items-center">
							<div class="flex-1">
								<p class="text-2xl font-bold text-gray-900">
									{formatCurrency(data.portfolio.totalValue)}
								</p>
								<div class="mt-1 flex items-center">
									<span class={getProfitLossClass(data.portfolio.totalProfitLoss)}>
										{formatCurrency(data.portfolio.totalProfitLoss)} ({formatPercent(
											data.portfolio.profitLossPercentage
										)})
									</span>
									<svg
										class={`ml-1 h-4 w-4 ${data.portfolio.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}
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
							</div>
						</div>

						<!-- Portfolio Chart für den Profilbenutzer -->
						<PortfolioChart userId={data.profileUser.id} color="#3B82F6" />
					</div>
				</div>

				<!-- Portfolio-Übersicht -->
				<div class="mb-6 rounded-lg bg-white shadow">
					<div class="p-6">
						<h2 class="mb-4 text-lg font-medium text-gray-900">
							Anlagen von {data.profileUser.username}
						</h2>

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
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 bg-white">
									{#each data.portfolio.items || [] as item}
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
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{:else}
				<div class="mb-6 rounded-lg bg-white p-6 shadow">
					<h2 class="mb-2 text-lg font-medium text-gray-900">Keine Portfolio-Daten</h2>
					<p class="text-gray-600">
						{data.profileUser.username} hat noch keine Kryptowährungen in seinem Portfolio.
					</p>
				</div>
			{/if}

			<!-- Letzte Transaktionen -->
			{#if hasTransactionData}
				<div class="rounded-lg bg-white shadow">
					<div class="p-6">
						<h2 class="mb-4 text-lg font-medium text-gray-900">Letzte Transaktionen</h2>

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
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
