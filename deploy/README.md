# TeamSight Tracker — Self-Hosted Deployment

## Prerequisites
- Docker + Docker Compose
- Nginx on the server

## 1. Upload project to server
```bash
scp -r . root@91.220.69.232:/opt/trello-timetracker
```

## 2. Configure environment
```bash
cd /opt/trello-timetracker
cp deploy/.env.server .env
nano .env  # fill in your values
```

## 3. Start services
```bash
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

## 4. Configure Nginx
Copy the nginx config and reload:
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/trello-timetracker
ln -sf /etc/nginx/sites-available/trello-timetracker /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 5. Update Trello Power-Up
In Trello developer settings, update the Power-Up URL to:
```
http://91.220.69.232/power-up/
```

## Commands
```bash
# View logs
docker compose -f deploy/docker-compose.prod.yml logs -f app

# Restart
docker compose -f deploy/docker-compose.prod.yml restart

# Stop
docker compose -f deploy/docker-compose.prod.yml down

# Rebuild
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

## Data
PostgreSQL data is stored in Docker volume `postgres_data`.
Back it up with:
```bash
docker compose -f deploy/docker-compose.prod.yml exec db pg_dump -U postgres trello_timetracker > backup.sql
```
