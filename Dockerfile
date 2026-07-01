FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.13-slim
WORKDIR /app
RUN pip install uv
COPY pyproject.toml .
RUN uv sync
COPY . .
COPY --from=frontend /app/dist/index.html /app/static/index.html
COPY --from=frontend /app/dist/assets/ /app/static/assets/
CMD ["uv", "run", "uvicorn", "src.presentation.main:app", "--host", "0.0.0.0", "--port", "8000"]
