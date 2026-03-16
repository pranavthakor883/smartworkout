import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib

# Load training dataset
data = pd.read_csv("fitness_training_data.csv")

# Encode categorical columns
le_goal = LabelEncoder()
data['fitness_goal'] = le_goal.fit_transform(data['fitness_goal'])

le_activity = LabelEncoder()
data['activity_level'] = le_activity.fit_transform(data['activity_level'])

# Features (X)
X = data[['age', 'weight', 'height', 'fitness_goal', 'activity_level']]

# Targets (Y)
y_level = data['fitness_level']
y_duration = data['workout_duration']

# Split data
X_train, X_test, y_train_level, y_test_level = train_test_split(
    X, y_level, test_size=0.2, random_state=42
)

X_train2, X_test2, y_train_duration, y_test_duration = train_test_split(
    X, y_duration, test_size=0.2, random_state=42
)

# Train classification model (Fitness Level)
clf = RandomForestClassifier(random_state=42)
clf.fit(X_train, y_train_level)

# Train regression model (Workout Duration)
reg = RandomForestRegressor(random_state=42)
reg.fit(X_train2, y_train_duration)

# Save models
joblib.dump(clf, "fitness_level_model.pkl")
joblib.dump(reg, "workout_duration_model.pkl")

# Save encoders (VERY IMPORTANT for prediction)
joblib.dump(le_goal, "goal_encoder.pkl")
joblib.dump(le_activity, "activity_encoder.pkl")

print("✅ Models and encoders trained and saved successfully!")