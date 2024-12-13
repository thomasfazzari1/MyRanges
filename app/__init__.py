from flask import Flask, render_template
from .routes import api
from .services import FileService


def create_app():
    app = Flask(__name__)

    FileService.initialize_ranges_file()

    app.register_blueprint(api, url_prefix='/api')

    @app.route("/")
    def index():
        return render_template("index.html")

    return app