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
cat > .env << 'EOF'
DB_USER=deploy
DB_PASSWORD=your_password
DB_HOST=database
DB_PORT=5433
TRELLO_API_KEY=your_key
TRELLO_API_TOKEN=your_token
EOF
```

## 3. Deploy
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 4. Configure Nginx
```bash
cp deploy/nginx.conf /etc/nginx/sites-available/trello-timetracker
ln -sf /etc/nginx/sites-available/trello-timetracker /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 5. Update Trello Power-Up URL
```
http://91.220.69.232/power-up/
```
