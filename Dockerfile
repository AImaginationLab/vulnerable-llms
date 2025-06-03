# Build step for the React frontend
FROM node:20 as frontend-builder
WORKDIR /app/frontend
COPY ./frontend/package.json ./frontend/package-lock.json* ./
RUN npm install
COPY ./frontend/ ./
RUN npm run build

# Build step for the Flask backend
FROM python:3.9-slim
WORKDIR /app
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY ./backend/ ./backend/

# Copy built frontend assets into the Flask static directory
COPY --from=frontend-builder /app/frontend/build /app/backend/static

# Set environment variable for Flask
ENV FLASK_APP=backend/app.py

# Expose the port the Flask app runs on
EXPOSE 5000

# Command to run the Flask development server
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]