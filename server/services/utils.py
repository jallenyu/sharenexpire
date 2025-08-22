import uuid
import hashlib


def generate_short_id():
    """
    Generate a short unique ID for file reference.
    """
    return uuid.uuid4().hex[:8]


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()
