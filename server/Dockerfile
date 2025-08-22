# Use official Python slim image
FROM python:3.12-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements first (better caching)
COPY ./requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . /app

# Expose the port Flask will run on
EXPOSE 5000

# Use Gunicorn for production-grade server
# 4 worker processes, bind to all interfaces
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "app:app"]
