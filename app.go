package main

import (
	"context"
	"embed"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/dev-parvej/offline_kanban/pkg/database"
)

var frontend embed.FS

type App struct {
	server *http.Server
	ctx    context.Context
	db     *database.Database
}

func NewApp() *App {
	return &App{}
}

func (app *App) startup(ctx context.Context) {
	app.ctx = ctx

	db, err := database.InitDatabase()
	if err != nil {
		panic(err)
	}
	app.db = db
	fmt.Println("Database initialized:", db)

	ip, err := GetLocalIP()
	if err != nil {
		ip = "localhost"
	}

	router := SetUpGorilaMuxServer(app.db)

	port := 8989

	app.server = &http.Server{
		Addr:              fmt.Sprintf(":%d", port),
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	writeFrontendConfig(fmt.Sprintf(`window.BACKEND_URL = "http://%s:%d";`, ip, port))

	go func() {
		fmt.Printf("Server available at: http://%s:%d\n", ip, port)
		if err := app.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Println("HTTP server error:", err)
		}
	}()
}

func (app *App) shutdown(ctx context.Context) {
	if app.server != nil {
		fmt.Println("Shutting down HTTP server...")
		_ = app.server.Shutdown(ctx)
	}
}

func isPrivateIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return false
	}
	privateBlocks := []string{
		"10.0.0.0/8",
		"172.16.0.0/12",
		"192.168.0.0/16",
	}
	for _, block := range privateBlocks {
		_, cidr, _ := net.ParseCIDR(block)
		if cidr.Contains(ip) {
			return true
		}
	}
	return false
}

func GetLocalIP() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}

	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.To4() == nil {
				continue
			}
			if isPrivateIP(ip) {
				return ip.String(), nil
			}
		}
	}
	return "", fmt.Errorf("no private IP found")
}

func writeFrontendConfig(ip string) error {
	// Path to where your React build files live (adjust this!)
	filePath := "frontend/config.js"

	return os.WriteFile(filePath, []byte(ip), 0644)
}
