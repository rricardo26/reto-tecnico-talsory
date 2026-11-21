package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/interseguro/optimal-routes-api/internal/domain"
)

type RouteHandler struct {
	finder domain.PathFinder
}

func NewRouteHandler(finder domain.PathFinder) *RouteHandler {
	return &RouteHandler{finder: finder}
}

func (h *RouteHandler) RegisterRoutes(r chi.Router, authMiddleware func(http.Handler) http.Handler) {
	r.Route("/api/v1/routes", func(api chi.Router) {
		api.Use(authMiddleware)
		api.Post("/optimal", h.CalculateOptimalRoute)
	})
}

func (h *RouteHandler) CalculateOptimalRoute(w http.ResponseWriter, r *http.Request) {
	var req domain.OptimalRouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{
			"error": "malformed JSON payload: " + err.Error(),
		})
		return
	}

	res, err := h.finder.FindOptimalRoute(req)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidInput), errors.Is(err, domain.ErrNegativeWeight):
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		case errors.Is(err, domain.ErrUnreachableLocation):
			respondJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
		default:
			respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		}
		return
	}

	respondJSON(w, http.StatusOK, res)
}

func respondJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
