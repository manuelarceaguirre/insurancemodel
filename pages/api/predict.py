from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

def read_csv():
    return pd.read_csv('public/insurance.csv')

def handler(request):
    if request.method == 'POST':
        try:
            params = json.loads(request.body)
            
            df = read_csv()
            X = df[['age', 'bmi', 'children']]
            y = df['charges']

            model = GradientBoostingRegressor(
                n_estimators=params['n_estimators'],
                learning_rate=params['learning_rate'],
                max_depth=params['max_depth'],
                random_state=42
            )

            model.fit(X, y)
            predictions = model.predict(X)

            response_data = [
                {
                    'index': i,
                    'actual': float(y.iloc[i]),
                    'predicted': float(predictions[i])
                }
                for i in range(len(df))
            ]

            return {
                'statusCode': 200,
                'body': json.dumps(response_data),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)}),
                'headers': {
                    'Content-Type': 'application/json'
                }
            }

    return {
        'statusCode': 405,
        'body': json.dumps({'error': 'Method not allowed'}),
        'headers': {
            'Content-Type': 'application/json'
        }
    } 