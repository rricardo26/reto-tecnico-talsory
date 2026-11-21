<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Navbar from './components/Navbar.vue'
import JwtBanner from './components/JwtBanner.vue'
import EndorsementForm from './components/EndorsementForm.vue'
import JsonOutputViewer from './components/JsonOutputViewer.vue'
import RouteForm from './components/RouteForm.vue'
import RouteResultViewer from './components/RouteResultViewer.vue'
import TemplateAdmin from './components/TemplateAdmin.vue'
import { useEndorsementTranslator } from './composables/useEndorsementTranslator'
import { useRouteOptimizer } from './composables/useRouteOptimizer'

const activeTab = ref<'endorsement' | 'routes' | 'templates'>('endorsement')

const {
  form: endorseForm,
  rawJson: endorseRawJson,
  isJsonMode: isEndorseJsonMode,
  isLoading: isEndorseLoading,
  isTokenLoading,
  result: endorseResult,
  jwtToken,
  templates: endorseTemplates,
  loadRumboExample,
  loadTemplates,
  applyTemplate,
  toggleJsonMode: toggleEndorseJsonMode,
  addExtraField,
  removeExtraField,
  fetchToken,
  translate,
} = useEndorsementTranslator()

const {
  accidentLocation,
  depots,
  edges,
  newDepot,
  rawJson: routeRawJson,
  isJsonMode: isRouteJsonMode,
  isLoading: isRouteLoading,
  result: routeResult,
  loadLimaExample,
  toggleJsonMode: toggleRouteJsonMode,
  addDepot,
  removeDepot,
  addEdge,
  removeEdge,
  calculate: calculateRoute,
} = useRouteOptimizer()

onMounted(async () => {
  loadRumboExample()
  loadLimaExample()
  if (!jwtToken.value) {
    await fetchToken()
  }
  await loadTemplates()
})

watch(activeTab, (tab) => {
  if (tab === 'endorsement' && jwtToken.value) {
    loadTemplates()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
    <Navbar :active-tab="activeTab" @update:active-tab="activeTab = $event" />

    <main class="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
      <JwtBanner
        :token="jwtToken"
        :is-loading="isTokenLoading"
        @update:token="jwtToken = $event"
        @generate="fetchToken"
      />

      <div
        v-if="activeTab === 'endorsement'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-stretch"
      >
        <section class="h-full flex flex-col">
          <EndorsementForm
            :form="endorseForm"
            :raw-json="endorseRawJson"
            :is-json-mode="isEndorseJsonMode"
            :is-loading="isEndorseLoading"
            :templates="endorseTemplates"
            @update:raw-json="endorseRawJson = $event"
            @load-example="loadRumboExample"
            @toggle-mode="toggleEndorseJsonMode"
            @add-field="addExtraField"
            @remove-field="removeExtraField"
            @submit="translate"
            @select-template="applyTemplate"
          />
        </section>

        <section class="h-full flex flex-col">
          <JsonOutputViewer
            :result="endorseResult"
            :is-loading="isEndorseLoading"
          />
        </section>
      </div>

      <div
        v-else-if="activeTab === 'routes'"
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 items-stretch"
      >
        <section class="h-full flex flex-col">
          <RouteForm
            :accident-location="accidentLocation"
            :depots="depots"
            :edges="edges"
            :new-depot="newDepot"
            :raw-json="routeRawJson"
            :is-json-mode="isRouteJsonMode"
            :is-loading="isRouteLoading"
            @update:accident-location="accidentLocation = $event"
            @update:new-depot="newDepot = $event"
            @update:raw-json="routeRawJson = $event"
            @load-example="loadLimaExample"
            @toggle-mode="toggleRouteJsonMode"
            @add-depot="addDepot"
            @remove-depot="removeDepot"
            @add-edge="addEdge"
            @remove-edge="removeEdge"
            @submit="calculateRoute"
          />
        </section>

        <section class="h-full flex flex-col">
          <RouteResultViewer
            :result="routeResult"
            :is-loading="isRouteLoading"
          />
        </section>
      </div>

      <TemplateAdmin
        v-else-if="activeTab === 'templates'"
        :token="jwtToken"
      />
    </main>

    <footer class="border-t border-gray-200 bg-white py-4">
      <div class="max-w-6xl mx-auto px-4 text-center text-xs text-gray-400">
        Interseguro Compañía de Seguros S.A.
      </div>
    </footer>
  </div>
</template>
