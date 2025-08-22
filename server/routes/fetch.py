from flask import Blueprint, jsonify, current_app, request
from services.redis_service import get_file_metadata
import json
from services.utils import hash_password
from datetime import datetime, timezone

fetch_bp = Blueprint("fetch", __name__)


@fetch_bp.route("/f/<short_id>", methods=["GET"])
def fetch_file(short_id):
    """
    Fetch file metadata using short ID.
    """
    data = get_file_metadata(current_app.redis, short_id)
    if not data:
        return jsonify({"error": "File not found or expired"}), 404

    metadata = json.loads(data)
    if metadata["password"]:
        user_password = request.args.get("password")
        if not user_password:
            return jsonify({"requiresPassword": True}), 401
        if hash_password(user_password) != metadata["password"]:
            return jsonify({"error": "Invalid password"}), 403

    bucket = current_app.config.get("AWS_S3_BUCKET")
    now_ts = int(datetime.now(timezone.utc).timestamp())
    remaining_ttl = max(0, metadata["expires_at"] - now_ts)

    presigned_url = current_app.s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket, "Key": metadata["file_key"]},
        ExpiresIn=remaining_ttl,
    )

    return jsonify(
        {
            "fileKey": metadata["file_key"],
            "url": presigned_url,
            "expiresIn": remaining_ttl,
            "expiresAt": metadata["expires_at"],
        }
    )
