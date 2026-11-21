package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/interseguro/optimal-routes-api/internal/domain"
	"github.com/interseguro/optimal-routes-api/internal/service"
)

func TestRouteHandler(t *testing.T) {
	svc := service.NewDijkstraService()
	h := NewRouteHandler(svc)

	r := chi.NewRouter()
	noopAuth := func(next http.Handler) http.Handler { return next }
	h.RegisterRoutes(r, noopAuth)

	t.Run("Success 200 OK", func(t *testing.T) {
		payload := domain.OptimalRouteRequest{
			AccidentLocation: "San Isidro",
			Depots:           []string{"Miraflores"},
			Graph: map[string]map[string]int{
				"Miraflores": {"San Isidro": 7},
			},
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/v1/routes/optimal", bytes.NewReader(body))
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}

		var res domain.OptimalRouteResponse
		if err := json.NewDecoder(rec.Body).Decode(&res); err != nil {
			t.Fatalf("invalid json response: %v", err)
		}
		if res.Distance != 7 || res.FromDepot != "Miraflores" {
			t.Errorf("unexpected response: %+v", res)
		}
	})

	t.Run("400 Bad Request on invalid input", func(t *testing.T) {
		payload := domain.OptimalRouteRequest{
			AccidentLocation: "",
			Depots:           []string{},
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/v1/routes/optimal", bytes.NewReader(body))
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("400 Bad Request on malformed JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/v1/routes/optimal", bytes.NewReader([]byte("{invalid-json")))
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("422 Unprocessable Entity on unreachable location", func(t *testing.T) {
		payload := domain.OptimalRouteRequest{
			AccidentLocation: "Cusco",
			Depots:           []string{"Lima"},
			Graph: map[string]map[string]int{
				"Lima": {"Callao": 10},
			},
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/v1/routes/optimal", bytes.NewReader(body))
		rec := httptest.NewRecorder()

		r.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnprocessableEntity {
			t.Fatalf("expected 422, got %d", rec.Code)
		}
	})
}
