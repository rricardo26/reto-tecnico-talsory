<script setup lang="ts">
import { Shield, Route, Layers, LayoutTemplate } from '@lucide/vue'

defineProps<{
  activeTab: 'endorsement' | 'routes' | 'templates'
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'endorsement' | 'routes' | 'templates'): void
}>()
</script>

<template>
  <header class="border-b border-gray-200 bg-white sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
          <Shield class="w-4 h-4 text-white" />
        </div>
        <div>
          <span class="font-semibold text-base tracking-tight text-gray-900">Interseguro</span>
          <p class="text-xs text-gray-500 -mt-0.5">Servicios de suscripción y asistencia vial</p>
        </div>
      </div>

      <nav class="flex items-center gap-1 p-1 rounded-lg bg-gray-100">
        <button
          type="button"
          class="flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="activeTab === 'endorsement'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-800'"
          @click="emit('update:activeTab', 'endorsement')"
        >
          <Layers class="w-4 h-4" />
          <span>Endosos</span>
        </button>

        <button
          type="button"
          class="flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="activeTab === 'routes'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-800'"
          @click="emit('update:activeTab', 'routes')"
        >
          <Route class="w-4 h-4" />
          <span>Rutas de asistencia</span>
        </button>

        <button
          type="button"
          class="flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          :class="activeTab === 'templates'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-800'"
          @click="emit('update:activeTab', 'templates')"
        >
          <LayoutTemplate class="w-4 h-4" />
          <span>Plantillas</span>
        </button>
      </nav>
    </div>
  </header>
</template>
