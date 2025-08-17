package handlers

import (
	"context"
	"net/http"

	"github.com/docker/docker/client"
	"github.com/docker/docker/api/types/image"
	"github.com/gin-gonic/gin"
	"github.com/preetindersinghbadesha/harbory/internal/utils/response"
)

func GetAllImagesHandler() gin.HandlerFunc {
	return func(c *gin.Context){
		cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}
		defer cli.Close()
		
		images, err := cli.ImageList(context.Background(), image.ListOptions{})
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

		// Send images as JSON response
		if err := response.WriteJSONResponse(c.Writer, http.StatusOK, images); err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

	}
}

func GetImageByParams() gin.HandlerFunc{
	return func(c *gin.Context) {
		cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}
		defer cli.Close()

		imageID := c.Param("id")
		image, _, err := cli.ImageInspectWithRaw(context.Background(), imageID)
		if err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

		// Send image as JSON response
		if err := response.WriteJSONResponse(c.Writer, http.StatusOK, image); err != nil {
			errorResp := response.GeneralErrorResponse(err)
			_ = response.WriteJSONResponse(c.Writer, http.StatusInternalServerError, errorResp)
			return
		}

	}
}