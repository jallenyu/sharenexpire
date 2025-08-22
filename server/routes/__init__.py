from flask import Blueprint
from .upload import upload_bp
from .fetch import fetch_bp


def register_blueprints(app):
    app.register_blueprint(upload_bp)
    app.register_blueprint(fetch_bp)
