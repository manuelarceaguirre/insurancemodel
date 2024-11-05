import kagglehub
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np
import json

path = kagglehub.dataset_download("teertha/ushealthinsurancedataset")
print("Path to dataset files:", path)

# Find the CSV file within the downloaded dataset directory
for filename in os.listdir(path):
    if filename.endswith(".csv"):
        csv_file_path = os.path.join(path, filename)
        break  # Stop after finding the first CSV file

# Read the CSV file using the correct path
data = pd.read_csv(csv_file_path)
# Encode categorical variables
data = pd.get_dummies(data, columns=['sex', 'smoker', 'region'], drop_first=True)

# Separate features and target
X = data.drop('charges', axis=1)  # Features (independent variables)
y = data['charges']               # Target (dependent variable)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define parameter ranges to explore
n_estimators_range = [50, 100, 200]
learning_rate_range = [0.01, 0.05, 0.1]
max_depth_range = [2, 3, 5]

# Collect results
results = []

for n_estimators in n_estimators_range:
    for learning_rate in learning_rate_range:
        for max_depth in max_depth_range:
            # Initialize and train the model
            model = GradientBoostingRegressor(
                n_estimators=n_estimators,
                learning_rate=learning_rate,
                max_depth=max_depth,
                random_state=42
            )
            model.fit(X_train, y_train)

            # Make predictions and calculate metrics
            y_pred = model.predict(X_test)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)

            # Store the configuration and its results
            results.append({
                'n_estimators': n_estimators,
                'learning_rate': learning_rate,
                'max_depth': max_depth,
                'rmse': rmse,
                'mae': mae,
                'r2': r2
            })

# Save results to a JSON file for easy transfer
with open('model_performance_data.json', 'w') as f:
    json.dump(results, f)

print("Results saved to model_performance_data.json")
