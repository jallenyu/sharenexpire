import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from redis import Redis
from redis.connection import SSLConnection
import boto3

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app, origins=[os.getenv("FRONTEND_URL")])
    app.config["AWS_S3_BUCKET"] = os.getenv("S3_BUCKET_NAME")

    @app.route("/health")
    def health():
        return {"status": "Flask is running for ShareNExpire Backend"}

    # Initialize AWS S3 client
    app.s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )

    # Initialize Redis client
    app.redis = Redis.from_url(
        os.getenv("REDIS_URL"),
        decode_responses=True,
    )

    # Register blueprints
    from routes import register_blueprints

    register_blueprints(app)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
