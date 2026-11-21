package service

import (
	"errors"
	"reflect"
	"testing"

	"github.com/interseguro/optimal-routes-api/internal/domain"
)

func TestFindOptimalRoute(t *testing.T) {
	svc := NewDijkstraService()

	tests := []struct {
		name        string
		req         domain.OptimalRouteRequest
		expectedRes *domain.OptimalRouteResponse
		expectedErr error
	}{
		{
			name: "Caso oficial PDF: Miraflores vs Ate a San Isidro (distancia 7)",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "San Isidro",
				Depots:           []string{"Ate", "Miraflores"},
				Graph: map[string]map[string]int{
					"Miraflores": {
						"San Isidro": 7,
						"Surco":      5,
					},
					"Ate": {
						"La Molina":  4,
						"San Isidro": 15,
					},
					"Surco": {
						"San Isidro": 4,
					},
					"La Molina": {
						"San Isidro": 10,
					},
				},
			},
			expectedRes: &domain.OptimalRouteResponse{
				FromDepot: "Miraflores",
				To:        "San Isidro",
				Path:      []string{"Miraflores", "San Isidro"},
				Distance:  7,
			},
			expectedErr: nil,
		},
		{
			name: "Ruta multi-salto con seleccion de base mas cercana (Callao vs Ate a Lince)",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "Lince",
				Depots:           []string{"Ate", "Callao"},
				Graph: map[string]map[string]int{
					"Callao": {
						"San Miguel": 3,
					},
					"San Miguel": {
						"Magdalena": 2,
					},
					"Magdalena": {
						"Lince": 3,
					},
					"Ate": {
						"La Victoria": 6,
					},
					"La Victoria": {
						"Lince": 5,
					},
				},
			},
			expectedRes: &domain.OptimalRouteResponse{
				FromDepot: "Callao",
				To:        "Lince",
				Path:      []string{"Callao", "San Miguel", "Magdalena", "Lince"},
				Distance:  8,
			},
			expectedErr: nil,
		},
		{
			name: "Grafo dirigido y asimetrico (direccion respetada)",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "Surco",
				Depots:           []string{"BaseA", "BaseB"},
				Graph: map[string]map[string]int{
					"BaseA": {
						"Barranco": 2,
					},
					"Barranco": {
						"Surco": 5,
					},
					"Surco": {
						"BaseB": 1, // Sentido contrario: Surco -> BaseB no permite BaseB -> Surco
					},
					"BaseB": {
						"Chorrillos": 3,
					},
					"Chorrillos": {
						"Surco": 10,
					},
				},
			},
			expectedRes: &domain.OptimalRouteResponse{
				FromDepot: "BaseA",
				To:        "Surco",
				Path:      []string{"BaseA", "Barranco", "Surco"},
				Distance:  7,
			},
			expectedErr: nil,
		},
		{
			name: "Accidente en la misma ubicacion de un deposito (distancia 0)",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "Miraflores",
				Depots:           []string{"Ate", "Miraflores"},
				Graph: map[string]map[string]int{
					"Miraflores": {"Surco": 5},
					"Ate":        {"Miraflores": 12},
				},
			},
			expectedRes: &domain.OptimalRouteResponse{
				FromDepot: "Miraflores",
				To:        "Miraflores",
				Path:      []string{"Miraflores"},
				Distance:  0,
			},
			expectedErr: nil,
		},
		{
			name: "Ubicacion desconectada o inalcanzable",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "Iquitos",
				Depots:           []string{"Miraflores", "Ate"},
				Graph: map[string]map[string]int{
					"Miraflores": {"San Isidro": 5},
					"Ate":        {"La Molina": 4},
					"Iquitos":    {"Nauta": 10},
				},
			},
			expectedRes: nil,
			expectedErr: domain.ErrUnreachableLocation,
		},
		{
			name: "Deposito inexistente en el grafo y sin conexiones",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "San Isidro",
				Depots:           []string{"BaseFantasma"},
				Graph: map[string]map[string]int{
					"Miraflores": {"San Isidro": 5},
				},
			},
			expectedRes: nil,
			expectedErr: domain.ErrUnreachableLocation,
		},
		{
			name: "Deteccion de pesos negativos",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "San Isidro",
				Depots:           []string{"Miraflores"},
				Graph: map[string]map[string]int{
					"Miraflores": {"San Isidro": -5},
				},
			},
			expectedRes: nil,
			expectedErr: domain.ErrNegativeWeight,
		},
		{
			name: "Error por ubicacion de accidente vacia",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "   ",
				Depots:           []string{"Miraflores"},
				Graph:            map[string]map[string]int{},
			},
			expectedRes: nil,
			expectedErr: domain.ErrInvalidInput,
		},
		{
			name: "Error por lista de depositos vacia",
			req: domain.OptimalRouteRequest{
				AccidentLocation: "San Isidro",
				Depots:           []string{},
				Graph:            map[string]map[string]int{},
			},
			expectedRes: nil,
			expectedErr: domain.ErrInvalidInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, err := svc.FindOptimalRoute(tt.req)

			if tt.expectedErr != nil {
				if err == nil || !errors.Is(err, tt.expectedErr) {
					t.Fatalf("se esperaba error %v, pero se obtuvo %v", tt.expectedErr, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("error inesperado: %v", err)
			}

			if !reflect.DeepEqual(res, tt.expectedRes) {
				t.Errorf("resultado difiere.\nEsperado: %+v\nObtenido: %+v", tt.expectedRes, res)
			}
		})
	}
}
