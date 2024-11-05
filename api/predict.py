import pickle
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from http.server import BaseHTTPRequestHandler
import json

# Load the model
with open('api/model.pkl', 'rb') as f:
    model = pickle.load(f)

def predict(params):
    # Convert parameters to model input format
    features = np.array([[
        params['age'],
        params['bmi'],
        params['children'],
        1 if params['sex'] == 'male' else 0,
        1 if params['smoker'] == 'yes' else 0,
        # Add other features as needed
    ]])
    
    prediction = model.predict(features)[0]
    return float(prediction)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        params = json.loads(post_data)
        
        try:
            prediction = predict(params)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'prediction': prediction
            }).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e)
            }).encode()) 