import pickle
from your_training_script import final_model  # Import your trained model

# Save the model
with open('api/model.pkl', 'wb') as f:
    pickle.dump(final_model, f) 