services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: inventory-backend
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - ./backend:/var/www/html
    working_dir: /var/www/html
    networks:
      - inventory-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: inventory-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    networks:
      - inventory-network

networks:
  inventory-network: