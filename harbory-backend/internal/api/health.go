package api

import (
	"net/http"
	"github.com/gin-gonic/gin"

	"github.com/preetindersinghbadesha/harbory/internal/utils/response"
)

// HealthHandler returns the health status of the application
func HealthHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        healthyjson := map[string]interface{}{
            "status":  response.StatusOK,
            "service": "harbory-backend",
            "version": "1.0.0",
        }

        if err := response.WriteJSONResponse(c.Writer, http.StatusOK, healthyjson); err != nil {
            errorResp := response.Response{
                Status: response.StatusError,
                Error:  "Error writing response: " + err.Error(),
            }
            response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
            return
        }
    }
}


