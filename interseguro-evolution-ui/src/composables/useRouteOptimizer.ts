import { ref, computed, watch } from 'vue'
import { calculateOptimalRoute } from '../services/routeService'
import type {
  OptimalRouteRequest,
  RouteEdge,
  RouteResult,
} from '../types/route.types'
import axios from 'axios'

const LIMA_EXAMPLE_DEPOTS = ['Miraflores', 'Ate']
const LIMA_EXAMPLE_ACCIDENT = 'San Isidro'
const LIMA_EXAMPLE_EDGES: RouteEdge[] = [
  { from: 'Miraflores', to: 'San Isidro', distance: 7 },
  { from: 'Miraflores', to: 'Surco', distance: 5 },
  { from: 'Surco', to: 'San Isidro', distance: 4 },
  { from: 'Ate', to: 'La Molina', distance: 4 },
  { from: 'Ate', to: 'San Isidro', distance: 15 },
  { from: 'La Molina', to: 'San Isidro', distance: 10 },
  { from: 'Surco', to: 'Barranco', distance: 3 },
  { from: 'Barranco', to: 'Miraflores', distance: 2 },
]

export function useRouteOptimizer() {
  const accidentLocation = ref(LIMA_EXAMPLE_ACCIDENT)
  const depots = ref<string[]>([...LIMA_EXAMPLE_DEPOTS])
  const edges = ref<RouteEdge[]>([...LIMA_EXAMPLE_EDGES])

  const newDepot = ref('')
  const rawJson = ref('')
  const isJsonMode = ref(false)
  const isLoading = ref(false)
  const result = ref<RouteResult | null>(null)

  function edgesToGraph(edgeList: RouteEdge[]): Record<string, Record<string, number>> {
    const graph: Record<string, Record<string, number>> = {}
    for (const edge of edgeList) {
      const u = edge.from.trim()
      const v = edge.to.trim()
      if (!u || !v) continue
      if (!graph[u]) graph[u] = {}
      graph[u][v] = Number(edge.distance) || 0
    }
    return graph
  }

  function graphToEdges(graph: Record<string, Record<string, number>>): RouteEdge[] {
    const edgeList: RouteEdge[] = []
    for (const [from, neighbors] of Object.entries(graph)) {
      for (const [to, dist] of Object.entries(neighbors)) {
        edgeList.push({ from, to, distance: dist })
      }
    }
    return edgeList
  }

  const computedPayload = computed<OptimalRouteRequest>(() => ({
    accidentLocation: accidentLocation.value.trim(),
    depots: depots.value.map((d) => d.trim()).filter(Boolean),
    graph: edgesToGraph(edges.value),
  }))

  watch(
    computedPayload,
    (payload) => {
      if (!isJsonMode.value) {
        rawJson.value = JSON.stringify(payload, null, 2)
      }
    },
    { deep: true, immediate: true },
  )

  function loadLimaExample() {
    accidentLocation.value = LIMA_EXAMPLE_ACCIDENT
    depots.value = [...LIMA_EXAMPLE_DEPOTS]
    edges.value = [...LIMA_EXAMPLE_EDGES]
    isJsonMode.value = false
    rawJson.value = JSON.stringify(computedPayload.value, null, 2)
  }

  function toggleJsonMode() {
    if (!isJsonMode.value) {
      rawJson.value = JSON.stringify(computedPayload.value, null, 2)
      isJsonMode.value = true
      return
    }

    try {
      const parsed = JSON.parse(rawJson.value)
      if (parsed && typeof parsed === 'object') {
        if (parsed.accidentLocation) {
          accidentLocation.value = String(parsed.accidentLocation)
        }
        if (Array.isArray(parsed.depots)) {
          depots.value = parsed.depots.map(String)
        }
        if (parsed.graph && typeof parsed.graph === 'object') {
          edges.value = graphToEdges(parsed.graph)
        }
      }
    } catch {
      // JSON inválido: conserva modo JSON
    }
    isJsonMode.value = false
  }

  function addDepot() {
    const val = newDepot.value.trim()
    if (val && !depots.value.includes(val)) {
      depots.value.push(val)
      newDepot.value = ''
    }
  }

  function removeDepot(index: number) {
    depots.value.splice(index, 1)
  }

  function addEdge() {
    edges.value.push({ from: '', to: '', distance: 1 })
  }

  function removeEdge(index: number) {
    edges.value.splice(index, 1)
  }

  async function calculate() {
    isLoading.value = true
    result.value = null

    let payload: OptimalRouteRequest
    if (isJsonMode.value) {
      try {
        payload = JSON.parse(rawJson.value) as OptimalRouteRequest
      } catch {
        result.value = {
          status: 0,
          data: null,
          error: 'Error de sintaxis: El JSON proporcionado no es válido.',
        }
        isLoading.value = false
        return
      }
    } else {
      payload = computedPayload.value
    }

    try {
      const response = await calculateOptimalRoute(payload)
      result.value = {
        status: 200,
        data: response,
        error: null,
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        const body = err.response.data as { error?: string }
        let msg = body.error || 'Error al procesar la ruta'
        if (err.response.status === 422) {
          msg = 'Destino inalcanzable: la grúa no puede llegar al lugar del accidente desde ninguna base registrada.'
        } else if (err.response.status === 401) {
          msg = 'No autorizado: Token JWT ausente o inválido.'
        }
        result.value = {
          status: err.response.status,
          data: null,
          error: msg,
        }
      } else {
        result.value = {
          status: 0,
          data: null,
          error: 'No se pudo conectar con el Servicio de Rutas Óptimas (/api/v1/routes/optimal).',
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    accidentLocation,
    depots,
    edges,
    newDepot,
    rawJson,
    isJsonMode,
    isLoading,
    result,
    loadLimaExample,
    toggleJsonMode,
    addDepot,
    removeDepot,
    addEdge,
    removeEdge,
    calculate,
  }
}
