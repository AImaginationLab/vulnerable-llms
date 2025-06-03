from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
import os
from api import api_bp

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Register API blueprint
app.register_blueprint(api_bp, url_prefix='/api/v1/2025')

@app.route('/')
def serve_react_app():
    """Serve the React app"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_react_files(path):
    """Serve React static files"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(error):
    """Return React app for any 404 to handle client-side routing"""
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)