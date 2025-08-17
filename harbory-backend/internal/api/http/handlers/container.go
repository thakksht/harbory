package handlers

import (
	"context"
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gin-gonic/gin"
	"github.com/preetindersinghbadesha/harbory/internal/utils/response"
)

func GetAllContainersHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}
		defer cli.Close()

		containers, err := cli.ContainerList(context.Background(), container.ListOptions{})
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

		// Send all containers as JSON response
		if err := response.WriteJSONResponse(c.Writer, http.StatusOK, containers); err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}
	}
}

func GetContainerByParams() gin.HandlerFunc {
	return func(c *gin.Context) {
		cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}
		defer cli.Close()

		containerID := c.Param("id")
		container, _, err := cli.ContainerInspectWithRaw(context.Background(), containerID, true)
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

		// Send image as JSON response
		if err := response.WriteJSONResponse(c.Writer, http.StatusOK, container); err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

	}
}
