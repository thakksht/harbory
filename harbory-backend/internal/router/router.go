package router

import (
	"os"
	"net/http"

	"harbory-backend/internal/api"
	"harbory-backend/internal/repository"
	"harbory-backend/internal/service"
	"harbory-backend/internal/util"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func init() {
	os.Setenv("DOCKER_API_VERSION", "1.47")
}

func SetupRouter() *mux.Router {
	r := mux.NewRouter()
	dockerClient := util.GetDockerClient()

	containerRepo := repository.NewContainerRepository(dockerClient)
	imageRepo := repository.NewImageRepository(dockerClient)
	systemRepo := repository.NewSystemRepository(dockerClient)

	containerService := service.NewContainerService(containerRepo)
	imageService := service.NewImageService(imageRepo)
	systemService := service.NewSystemService(systemRepo)

	containerHandler := api.NewContainerHandler(containerService)
	imageHandler := api.NewImageHandler(imageService)
	logsHandler := api.NewLogsHandler(containerHandler)
	systemHandler := api.NewSystemHandler(systemService)

	c := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:5173", "http://localhost:5173/containers"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"*"},
        AllowCredentials: true,
    })

	r.Use(c.Handler)

	r.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
})
	r.HandleFunc("/api/containers", containerHandler.GetContainers).Methods("GET")
	r.HandleFunc("/api/containers/{id}/logs", logsHandler.GetContainerLogs)
	r.HandleFunc("/api/containers/{id}/start", containerHandler.StartContainer).Methods("POST")
	r.HandleFunc("/api/containers/{id}/stop", containerHandler.StopContainer).Methods("POST")
	r.HandleFunc("/api/containers/{id}/delete", containerHandler.DeleteContainer).Methods("DELETE")

	r.HandleFunc("/api/images", imageHandler.GetImages).Methods("GET")
	r.HandleFunc("/api/images/pull", imageHandler.PullImage).Methods("POST")
	r.HandleFunc("/api/images/{id}/delete", imageHandler.DeleteImage).Methods("DELETE")
	r.HandleFunc("/api/images/{id}/inspect", imageHandler.InspectImage).Methods("GET")
	r.HandleFunc("/ws/images/{id}/pull", imageHandler.PullImageResp)

	r.HandleFunc("/api/system/info", systemHandler.GetSystemInfo).Methods("GET")

	return r
}
