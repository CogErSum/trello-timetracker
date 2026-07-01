# TeamSight Tracker — Self-Hosted Deployment

## Server Info
- IP: 91.220.69.232
- App port: 8080
- PostgreSQL: existing instance on port 5433

## 1. Upload project to server
```bash
scp -r . root@91.220.69.232:/opt/trello-timetracker
```

## 2. Configure environment
```bash
cd /opt/trello-timetracker
cp deploy/.env.server .env
nano .env
```

## 3. Deploy
```bash
docker compose -f deploy/docker-compose.prod.yml up -d --build
```
App automatically creates database and tables on first start.

## 4. Configure Nginx
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/trello-timetracker
ln -sf /etc/nginx/sites-available/trello-timetracker /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 5. Update Trello Power-Up URL
In Trello developer settings, set the Power-Up URL to:
```
http://91.220.69.232/power-up/
```

## Commands
```bash
docker compose -f deploy/docker-compose.prod.yml logs -f app
docker compose -f deploy/docker-compose.prod.yml restart
docker compose -f deploy/docker-compose.prod.yml down
docker compose -f deploy/docker-compose.prod.yml up -d --build
```
