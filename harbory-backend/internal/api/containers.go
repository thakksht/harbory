package api

import (
	"encoding/json"
	"net/http"

	"harbory-backend/internal/domain"

	"github.com/docker/docker/api/types/container"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type ContainerHandler struct {
	service  domain.ContainerService
	upgrader websocket.Upgrader
}

func NewContainerHandler(service domain.ContainerService) *ContainerHandler {
	return &ContainerHandler{
		service: service,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *ContainerHandler) GetContainers(w http.ResponseWriter, r *http.Request) {
	containers, err := h.service.List(r.Context(), true)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(containers)
}

func (h *ContainerHandler) StartContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	err := h.service.Start(r.Context(), containerID)
	if err != nil {
		http.Error(w, "Failed to start container: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Container started successfully"))
}

func (h *ContainerHandler) StopContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	err := h.service.Stop(r.Context(), containerID)
	if err != nil {
		http.Error(w, "Failed to stop container: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Container stopped successfully"))
}

func (h *ContainerHandler) DeleteContainer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	err := h.service.Delete(r.Context(), containerID)
	if err != nil {
		http.Error(w, "Failed to delete container: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Container deleted successfully"))
}

func (h *ContainerHandler) GetContainerLogs(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	containerID := vars["id"]

	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		conn.Close()
		return
	}

	options := container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Tail:       "100",
	}

	logs, err := h.service.GetLogs(r.Context(), containerID, options)
	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error getting logs: "+err.Error()))
		return
	}

	conn.WriteMessage(websocket.TextMessage, []byte(logs))
}
