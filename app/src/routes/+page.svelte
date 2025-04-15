<script>
  import { page } from '$app/stores';
  
  // Benutzerinformationen aus dem Seitenkontext
  $: isLoggedIn = !!$page.data.user;
  $: user = $page.data.user;
</script>

<div class="relative isolate">
  <!-- Hero-Bereich -->
  <div class="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Trading-Simulator
      </h1>
      
      {#if isLoggedIn}
        <!-- Angepasster Content für eingeloggte Benutzer -->
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Willkommen zurück, <span class="font-semibold">{user.username}</span>! 
          Setze dein Trading fort und verfolge deine Fortschritte.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/dashboard"
            class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            Zum Dashboard
          </a>
          <a href="/cryptos" class="text-sm font-semibold leading-6 text-gray-900">
            Kryptowährungen anzeigen <span aria-hidden="true">→</span>
          </a>
        </div>
      {:else}
        <!-- Originaler Content für nicht eingeloggte Benutzer -->
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Starte ins Trading mit virtuellem Geld. Kaufe und verkaufe Kryptowährungen, 
          verfolge deine Performance und vergleiche dich mit anderen Tradern.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/register"
            class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Kostenlos starten
          </a>
          <a href="/cryptos" class="text-sm font-semibold leading-6 text-gray-900">
            Kryptowährungen anzeigen <span aria-hidden="true">→</span>
          </a>
        </div>
      {/if}
    </div>
  </div>

  <!-- Funktionen-Abschnitt -->
  <div class="bg-white py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2 class="text-base font-semibold leading-7 text-blue-600">Trading-Simulator</h2>
        
        {#if isLoggedIn}
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Nutze alle Funktionen
          </p>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            Du hast Zugriff auf alle Funktionen unseres Simulators. Verbessere deine Trading-Fähigkeiten und entwickle erfolgreiche Strategien.
          </p>
        {:else}
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Alles was du zum Trading lernen brauchst
          </p>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            Mit unserem Simulator kannst du Kryptowährungen handeln, ohne echtes Geld zu riskieren.
            Perfekt zum Lernen und Testen von Strategien.
          </p>
        {/if}
      </div>
      
      <!-- Der Rest bleibt gleich -->
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-gray-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              Virtuelles Geld
            </dt>
            <dd class="mt-2 text-base leading-7 text-gray-600">
              Starte mit 10.000€ virtuellem Geld und teste deine Trading-Strategien ohne Risiko.
            </dd>
          </div>
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-gray-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
              </div>
              Echtzeitkurse
            </dt>
            <dd class="mt-2 text-base leading-7 text-gray-600">
              Verfolge die aktuellen Kurse von beliebten Kryptowährungen in Echtzeit.
            </dd>
          </div>
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-gray-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19 9 7.382V18l-6-3v-7.382L6.115 5.19Zm14-1.5a.75.75 0 0 0-.729.57 6.75 6.75 0 0 1-8.835 4.696.75.75 0 0 0-.956.393l-.291.682A8.25 8.25 0 0 0 15.992 22a.748.748 0 0 0 .722-.582 6.75 6.75 0 0 1 8.835-4.696.75.75 0 0 0 .956-.393l.291-.682A8.25 8.25 0 0 0 20.007 3.698Z" />
                </svg>
              </div>
              Ranglisten
            </dt>
            <dd class="mt-2 text-base leading-7 text-gray-600">
              Vergleiche deine Performance mit anderen Tradern und steige in der Rangliste auf.
            </dd>
          </div>
          <div class="relative pl-16">
            <dt class="text-base font-semibold leading-7 text-gray-900">
              <div class="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              Community
            </dt>
            <dd class="mt-2 text-base leading-7 text-gray-600">
              Tausche dich mit anderen Tradern aus, lerne von ihren Strategien und teile deine Erfahrungen.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</div>