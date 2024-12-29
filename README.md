# Insurance Cost Predictor

An interactive web application that predicts health insurance costs using machine learning. Users can adjust model parameters in real-time to see how different configurations affect prediction accuracy.

## Features

- Interactive visualization of insurance cost predictions
- Real-time parameter adjustment with immediate feedback
- Comparison between actual and predicted insurance charges
- Best model configuration display with performance metrics
- Responsive design for desktop and mobile devices

## Tech Stack

- Frontend: Next.js, React, Recharts
- Backend: Python (scikit-learn)
- Machine Learning: Gradient Boosting Regressor
- Styling: CSS Modules

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/insurance-predictor.git
   cd insurance-predictor
   ```

2. Install dependencies:
   ```
   npm install
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Model Parameters

Users can adjust the following parameters:
- Number of estimators (50-300)
- Learning rate (0.001-0.2)
- Maximum depth (2-7)
- Minimum samples split (2-10)
- Subsample ratio (0.7-1.0)

## Dataset

The project uses the US Health Insurance Dataset from Kaggle, which includes features such as age, BMI, smoking status, and region to predict insurance charges.
