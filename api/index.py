from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json

# Load the model performance data
with open('model_performance_data.json', 'r') as f:
    model_data = json.load(f)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        # Parse the URL and query parameters
        url = urlparse(self.path)
        path = url.path
        query = parse_qs(url.query)

        if path == '/api/parameter-ranges':
            # Get unique values for each parameter
            response = {
                "n_estimators": sorted(list(set(d['n_estimators'] for d in model_data))),
                "learning_rates": sorted(list(set(d['learning_rate'] for d in model_data))),
                "max_depths": sorted(list(set(d['max_depth'] for d in model_data)))
            }
        else:
            # Filter results based on parameters
            filtered_data = model_data

            if 'n_estimators' in query:
                n_est = int(query['n_estimators'][0])
                filtered_data = [d for d in filtered_data if d['n_estimators'] == n_est]
            
            if 'learning_rate' in query:
                lr = float(query['learning_rate'][0])
                filtered_data = [d for d in filtered_data if d['learning_rate'] == lr]
            
            if 'max_depth' in query:
                depth = int(query['max_depth'][0])
                filtered_data = [d for d in filtered_data if d['max_depth'] == depth]

            response = filtered_data

        self.wfile.write(json.dumps(response).encode())
        return 