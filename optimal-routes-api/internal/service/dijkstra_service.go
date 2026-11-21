package service

import (
	"container/heap"
	"strings"

	"github.com/interseguro/optimal-routes-api/internal/domain"
)

type pqItem struct {
	node   string
	dist   int
	origin string
	index  int
}

type priorityQueue []*pqItem

func (pq priorityQueue) Len() int           { return len(pq) }
func (pq priorityQueue) Less(i, j int) bool { return pq[i].dist < pq[j].dist }
func (pq priorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}
func (pq *priorityQueue) Push(x any) {
	n := len(*pq)
	item := x.(*pqItem)
	item.index = n
	*pq = append(*pq, item)
}
func (pq *priorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil
	item.index = -1
	*pq = old[0 : n-1]
	return item
}

type DijkstraService struct{}

func NewDijkstraService() *DijkstraService {
	return &DijkstraService{}
}

func (s *DijkstraService) FindOptimalRoute(req domain.OptimalRouteRequest) (*domain.OptimalRouteResponse, error) {
	target := strings.TrimSpace(req.AccidentLocation)
	if target == "" || len(req.Depots) == 0 {
		return nil, domain.ErrInvalidInput
	}

	for _, edges := range req.Graph {
		for _, weight := range edges {
			if weight < 0 {
				return nil, domain.ErrNegativeWeight
			}
		}
	}

	pq := &priorityQueue{}
	heap.Init(pq)

	dist := make(map[string]int)
	parent := make(map[string]string)
	originDepot := make(map[string]string)
	visited := make(map[string]bool)

	validDepots := 0
	for _, rawDepot := range req.Depots {
		d := strings.TrimSpace(rawDepot)
		if d == "" {
			continue
		}
		if _, seen := dist[d]; seen {
			continue
		}
		validDepots++
		dist[d] = 0
		parent[d] = ""
		originDepot[d] = d
		heap.Push(pq, &pqItem{node: d, dist: 0, origin: d})
	}

	if validDepots == 0 {
		return nil, domain.ErrInvalidInput
	}

	found := false
	for pq.Len() > 0 {
		curr := heap.Pop(pq).(*pqItem)
		u := curr.node

		if visited[u] {
			continue
		}
		visited[u] = true

		if u == target {
			found = true
			break
		}

		for v, weight := range req.Graph[u] {
			if visited[v] {
				continue
			}
			newDist := curr.dist + weight
			if curD, ok := dist[v]; !ok || newDist < curD {
				dist[v] = newDist
				parent[v] = u
				originDepot[v] = curr.origin
				heap.Push(pq, &pqItem{node: v, dist: newDist, origin: curr.origin})
			}
		}
	}

	if !found {
		return nil, domain.ErrUnreachableLocation
	}

	path := make([]string, 0)
	curr := target
	for curr != "" {
		path = append(path, curr)
		curr = parent[curr]
	}

	for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
		path[i], path[j] = path[j], path[i]
	}

	return &domain.OptimalRouteResponse{
		FromDepot: originDepot[target],
		To:        target,
		Path:      path,
		Distance:  dist[target],
	}, nil
}
