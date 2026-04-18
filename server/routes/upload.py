from flask import Blueprint, request, jsonify, current_app
from services.redis_service import store_file_metadata
from services.utils import generate_short_id, hash_password
from datetime import datetime, timezone, timedelta

upload_bp = Blueprint("upload", __name__)

PART_SIZE = 10 * 1024 * 1024  # 10 MB — S3 minimum is 5 MB


@upload_bp.route("/upload/initiate", methods=["POST"])
def initiate_upload():
    """Step 1: Create a multipart upload and return uploadId + fileKey."""
    data = request.get_json()
    filename = data.get("filename")
    content_type = data.get("contentType", "application/octet-stream")

    if not filename:
        return jsonify({"error": "filename is required"}), 400

    short_id = generate_short_id()
    file_key = f"{short_id}-{filename}"
    bucket = current_app.config.get("AWS_S3_BUCKET")

    response = current_app.s3.create_multipart_upload(
        Bucket=bucket,
        Key=file_key,
        ContentType=content_type,
    )

    return jsonify({
        "uploadId": response["UploadId"],
        "fileKey": file_key,
        "partSize": PART_SIZE,
    })


@upload_bp.route("/upload/presign-part", methods=["POST"])
def presign_part():
    """Step 2: Return a presigned URL for a single chunk. Called once per part."""
    data = request.get_json()
    file_key = data.get("fileKey")
    upload_id = data.get("uploadId")
    part_number = data.get("partNumber")  # 1-indexed, max 10 000

    if not all([file_key, upload_id, part_number]):
        return jsonify({"error": "fileKey, uploadId, and partNumber are required"}), 400

    bucket = current_app.config.get("AWS_S3_BUCKET")

    presigned_url = current_app.s3.generate_presigned_url(
        "upload_part",
        Params={
            "Bucket": bucket,
            "Key": file_key,
            "UploadId": upload_id,
            "PartNumber": part_number,
        },
        ExpiresIn=3600,  # 1 hour per part
    )

    return jsonify({"presignedUrl": presigned_url})


@upload_bp.route("/upload/complete", methods=["POST"])
def complete_upload():
    """Step 3: Finalise the multipart upload and store metadata in Redis."""
    data = request.get_json()
    file_key = data.get("fileKey")
    upload_id = data.get("uploadId")
    parts = data.get("parts")          # [{ PartNumber, ETag }, ...]
    expires_in = data.get("expiresIn")
    password = data.get("password")

    if not all([file_key, upload_id, parts, expires_in]):
        return jsonify({"error": "fileKey, uploadId, parts, and expiresIn are required"}), 400

    bucket = current_app.config.get("AWS_S3_BUCKET")

    current_app.s3.complete_multipart_upload(
        Bucket=bucket,
        Key=file_key,
        UploadId=upload_id,
        MultipartUpload={"Parts": parts},
    )

    expires_in = int(expires_in)
    expires_at = int(
        (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).timestamp()
    )
    short_id = file_key.split("-", 1)[0]

    metadata = {
        "file_key": file_key,
        "password": hash_password(password) if password else None,
        "expires_at": expires_at,
    }
    store_file_metadata(current_app.redis, short_id, metadata, expires_in)

    return jsonify({
        "fileKey": file_key,
        "expiresIn": expires_in,
        "expiresAt": expires_at,
    })