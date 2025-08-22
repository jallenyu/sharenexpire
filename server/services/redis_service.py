import json


def store_file_metadata(redis_client, short_id, metadata, expires_in):
    """
    Store file URL in Redis with expiration.
    """
    redis_client.setex(short_id, expires_in, json.dumps(metadata))


def get_file_metadata(redis_client, short_id):
    """
    Retrieve file URL from Redis by short_id.
    """
    value = redis_client.get(short_id)
    return value.decode("utf-8") if value else None
