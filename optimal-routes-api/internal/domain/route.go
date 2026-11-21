package domain

import "errors"

var (
	ErrUnreachableLocation = errors.New("accident location is unreachable from any depot")
	ErrInvalidInput        = errors.New("invalid input: accidentLocation and depots cannot be empty")
	ErrNegativeWeight      = errors.New("graph contains negative edge weight")
)

type OptimalRouteRequest struct {
	AccidentLocation string                    `json:"accidentLocation"`
	Depots           []string                  `json:"depots"`
	Graph            map[string]map[string]int `json:"graph"`
}

type OptimalRouteResponse struct {
	FromDepot string   `json:"fromDepot"`
	To        string   `json:"to"`
	Path      []string `json:"path"`
	Distance  int      `json:"distance"`
}

type PathFinder interface {
	FindOptimalRoute(req OptimalRouteRequest) (*OptimalRouteResponse, error)
}
