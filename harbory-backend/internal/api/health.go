package api

import (
	"net/http"

	"github.com/preetindersinghbadesha/harbory/internal/utils/response"
)

// HealthHandler returns the health status of the application
func HealthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		healthResponse := map[string]interface{}{
			"status":  "healthy",
			"service": "harbory-backend",
			"version": "1.0.0",
		}

		if err := response.WriteJSONResponse(w, http.StatusOK, healthResponse); err != nil {
			errorResp := response.Response{
				Status: response.StatusError,
				Error:  "Error writing response: " + err.Error(),
			}
			response.WriteJSONResponse(w, http.StatusInternalServerError, errorResp)
			return
		}
	}
}
