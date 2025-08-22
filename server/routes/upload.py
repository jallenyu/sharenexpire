from flask import Blueprint, request, jsonify, current_app
from services.s3_service import upload_file_to_s3
from services.redis_service import store_file_metadata
from services.utils import generate_short_id, hash_password
from datetime import datetime, timezone, timedelta

upload_bp = Blueprint("upload", __name__)


@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    """
    Handles file uploads.
    - Saves file to S3
    - Stores metadata in Redis with expiry
    - Returns the file key and its expiration
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    password = request.form.get("password", None)
    expires_in = int(request.form.get("expiresIn"))
    expires_at = int(
        (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).timestamp()
    )

    short_id = generate_short_id()
    bucket = current_app.config.get("AWS_S3_BUCKET")

    # Upload to S3
    file_key = f"{short_id}-{file.filename}"
    upload_file_to_s3(current_app.s3, bucket, file_key, file)

    # Store metadata in Redis
    metadata = {
        "file_key": file_key,
        "password": hash_password(password) if password else None,
        "expires_at": expires_at,
    }
    store_file_metadata(current_app.redis, short_id, metadata, expires_in)

    return jsonify(
        {
            "fileKey": file_key,
            "expiresIn": expires_in,
            "expiresAt": expires_at,
        }
    )
