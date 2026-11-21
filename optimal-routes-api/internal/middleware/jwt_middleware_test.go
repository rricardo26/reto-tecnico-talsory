package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestJWTMiddleware(t *testing.T) {
	secret := "test-secret"
	mw := JWTMiddleware(secret)

	nextHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	t.Run("Missing Authorization Header", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/test", nil)
		rec := httptest.NewRecorder()

		mw(nextHandler).ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
		}
	})

	t.Run("Invalid Format Header", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/test", nil)
		req.Header.Set("Authorization", "InvalidHeaderToken")
		rec := httptest.NewRecorder()

		mw(nextHandler).ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
		}
	})

	t.Run("Invalid Token Signature", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": "user",
			"exp": time.Now().Add(time.Hour).Unix(),
		})
		signed, err := token.SignedString([]byte("wrong-secret"))
		if err != nil {
			t.Fatalf("failed to sign token: %v", err)
		}

		req := httptest.NewRequest("POST", "/test", nil)
		req.Header.Set("Authorization", "Bearer "+signed)
		rec := httptest.NewRecorder()

		mw(nextHandler).ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
		}
	})

	t.Run("Valid Token", func(t *testing.T) {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": "user",
			"exp": time.Now().Add(time.Hour).Unix(),
		})
		signed, err := token.SignedString([]byte(secret))
		if err != nil {
			t.Fatalf("failed to sign token: %v", err)
		}

		req := httptest.NewRequest("POST", "/test", nil)
		req.Header.Set("Authorization", "Bearer "+signed)
		rec := httptest.NewRecorder()

		mw(nextHandler).ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, rec.Code)
		}
	})
}
