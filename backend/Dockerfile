FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh
EXPOSE 8000
ENTRYPOINT ["/bin/sh", "/app/start.sh"]
