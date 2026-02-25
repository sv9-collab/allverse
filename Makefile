.PHONY: build run install mcp tunnel

install:
	npm install

build: install
	@echo "Building production bundles for ubuntu2 orb.local..."
	npx vite build

run:
	@echo "Establishing database connection and starting backend..."
	npm start

tunnel:
	@echo "Launching Cloudflare Tunnel to expose ubuntu2 globally..."
	@echo "Look for the 'https://...' link in the output below."
	cloudflared tunnel --url http://localhost:3000

mcp:
	@echo "Starting ALLVERSE MCP Server..."
	npm run mcp
