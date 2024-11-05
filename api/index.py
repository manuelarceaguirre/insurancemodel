from http.server import BaseHTTPRequestHandler
import json

# Load model performance data
with open('public/model_performance_data.json', 'r') as f:
    model_data = json.load(f)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path.startswith('/api/parameter-ranges'):
            # Get unique parameter ranges
            response = {
                "n_estimators": [50, 100, 200],
                "learning_rates": [0.01, 0.05, 0.1],
                "max_depths": [2, 3, 5]
            }
        else:
            # Return model performance data
            response = model_data

        self.wfile.write(json.dumps(response).encode())
        return