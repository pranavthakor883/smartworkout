from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import bcrypt
from datetime import datetime
import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# ------------------ ML Models ------------------
clf = joblib.load("fitness_level_model.pkl")
reg = joblib.load("workout_duration_model.pkl")

import random


def generate_schedule(activity, goal="weight_loss", recommended_workout=None):
    import random

    week_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    # Activity multiplier
    activity_multiplier = {
        "sedentary": 0.8,
        "lightly_active": 1.0,
        "moderately_active": 1.2,
        "very_active": 1.5
    }
    multiplier = activity_multiplier.get(activity, 1.0)

    # Rest days per goal
    rest_days = {
        "muscle_gain": ["Tuesday", "Thursday", "Sunday"],
        "weight_loss": ["Sunday"],
        "endurance": ["Sunday"],
        "general_fitness": ["Sunday"]
    }

    # Muscle gain split
    muscle_split = {
        "Monday": [
            {"name": "Barbell Bench Press", "sets": 4, "reps": 8},
            {"name": "Incline Dumbbell Press", "sets": 3, "reps": 10},
            {"name": "Chest Fly", "sets": 3, "reps": 12},
        ],
        "Wednesday": [
            {"name": "Deadlifts", "sets": 4, "reps": 6},
            {"name": "Pull-ups", "sets": 3, "reps": 10},
            {"name": "Dumbbell Rows", "sets": 3, "reps": 10},
        ],
        "Friday": [
            {"name": "Squats", "sets": 4, "reps": 8},
            {"name": "Leg Press", "sets": 3, "reps": 10},
            {"name": "Lunges", "sets": 3, "reps": 12},
        ],
        "Saturday": [
            {"name": "Bicep Curls", "sets": 3, "reps": 12},
            {"name": "Tricep Dips", "sets": 3, "reps": 12},
            {"name": "Hammer Curls", "sets": 3, "reps": 10},
        ]
    }

    # Weight loss split
    weight_loss_split = {
        "Monday": [
            {"name": "Jumping Jacks", "sets": 3, "reps": 20},
            {"name": "Burpees", "sets": 3, "reps": 12},
            {"name": "Push-ups", "sets": 3, "reps": 12},
        ],
        "Tuesday": [
            {"name": "Mountain Climbers", "sets": 3, "reps": 40},
            {"name": "High Knees", "sets": 3, "reps": 30},
            {"name": "Bodyweight Squats", "sets": 3, "reps": 15},
        ],
        "Wednesday": [
            {"name": "Jumping Jacks", "sets": 3, "reps": 20},
            {"name": "Burpees", "sets": 3, "reps": 12},
            {"name": "Push-ups", "sets": 3, "reps": 12},
        ],
        "Thursday": [
            {"name": "Mountain Climbers", "sets": 3, "reps": 40},
            {"name": "High Knees", "sets": 3, "reps": 30},
            {"name": "Bodyweight Squats", "sets": 3, "reps": 15},
        ],
        "Friday": [
            {"name": "Jumping Jacks", "sets": 3, "reps": 20},
            {"name": "Burpees", "sets": 3, "reps": 12},
            {"name": "Push-ups", "sets": 3, "reps": 12},
        ],
        "Saturday": [
            {"name": "Mountain Climbers", "sets": 3, "reps": 40},
            {"name": "High Knees", "sets": 3, "reps": 30},
            {"name": "Bodyweight Squats", "sets": 3, "reps": 15},
        ],
    }

    # Endurance split
    endurance_split = {
        "Monday": [{"name": "Running", "sets": 1, "reps": 30}, {"name": "Cycling", "sets": 1, "reps": 30}],
        "Tuesday": [{"name": "Jump Rope", "sets": 3, "reps": 120}],
        "Wednesday": [{"name": "Rowing", "sets": 1, "reps": 20}, {"name": "Stair Climbing", "sets": 3, "reps": 20}],
        "Thursday": [{"name": "Running", "sets": 1, "reps": 30}],
        "Friday": [{"name": "Cycling", "sets": 1, "reps": 30}, {"name": "Jump Rope", "sets": 3, "reps": 120}],
        "Saturday": [{"name": "Rowing", "sets": 1, "reps": 20}, {"name": "Stair Climbing", "sets": 3, "reps": 20}],
    }

    # General fitness split
    general_split = {
        "Monday": [{"name": "Push-ups", "sets": 3, "reps": 12}, {"name": "Bodyweight Squats", "sets": 3, "reps": 15}],
        "Tuesday": [{"name": "Plank", "sets": 3, "reps": 45}],
        "Wednesday": [{"name": "Lunges", "sets": 3, "reps": 12}, {"name": "Dumbbell Shoulder Press", "sets": 3, "reps": 12}],
        "Thursday": [{"name": "Jump Rope", "sets": 3, "reps": 80}],
        "Friday": [{"name": "Push-ups", "sets": 3, "reps": 12}, {"name": "Bodyweight Squats", "sets": 3, "reps": 15}],
        "Saturday": [{"name": "Plank", "sets": 3, "reps": 45}],
    }

    schedule = []

    for day in week_days:
        if day in rest_days.get(goal, []):
            schedule.append({"day": day, "exercises": [{"name": "Rest Day", "sets": 0, "reps": 0}]})
            continue

        # Pick exercises based on goal
        if goal == "muscle_gain":
            exercises = muscle_split.get(day, muscle_split["Monday"])
        elif goal == "weight_loss":
            exercises = weight_loss_split.get(day, weight_loss_split["Monday"])
        elif goal == "endurance":
            exercises = endurance_split.get(day, endurance_split["Monday"])
        else:
            exercises = general_split.get(day, general_split["Monday"])

        day_exercises = []
        for ex in exercises:
            sets = max(1, int(ex["sets"] * multiplier))
            reps = max(1, int(ex["reps"] * multiplier))
            if recommended_workout and goal in ["weight_loss", "endurance"]:
                factor = recommended_workout / 30
                sets = max(1, int(sets * factor))
                reps = int(reps * factor)
            day_exercises.append({"name": ex["name"], "sets": sets, "reps": reps})

        schedule.append({"day": day, "exercises": day_exercises})

    return schedule

goal_encoder = LabelEncoder()
goal_encoder.fit([
    "weight_loss",
    "muscle_gain",
    "endurance",
    "general_fitness"
])

activity_encoder = LabelEncoder()
activity_encoder.fit([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active"
])

# ------------------ Database ------------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1146",
    database="fitness_app"
)
cursor = db.cursor(dictionary=True)


def log(message):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}")


# ------------------ Routes ------------------
@app.route("/")
def home():
    log("Home endpoint called")
    return jsonify({"message": "SmartWorkout is connected!"})


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    log(f"[SIGNUP ATTEMPT] Data received: {data}")

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    age = data.get("age")
    height = data.get("height")
    weight = data.get("weight")
    fitness_goal = data.get("fitness_goal")
    fitness_goal = fitness_goal.lower().replace(" ", "_")
    activity_level = data.get("activity_level")

    if not email or not password:
        log("[SIGNUP ERROR] Missing required fields")
        return jsonify({"status": "error", "message": "Missing required fields"})

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


    # Check if user already exists
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:

        sql = """
            UPDATE users 
            SET name=%s, age=%s, height=%s, weight=%s, 
                fitness_goal=%s, activity_level=%s
            WHERE email=%s
        """

        cursor.execute(sql, (name, age, height, weight, fitness_goal, activity_level, email))
        db.commit()

        user_id = existing_user["id"]

        log(f"[PROFILE UPDATED] {email}")

        return jsonify({
            "status": "updated",
            "user": {
                "id": user_id,
                "name": name,
                "age": age,
                "weight": weight,
                "height": height,
                "goal": fitness_goal,
                "activityLevel": activity_level,
                "email": email
            }
        })

    try:
        sql = """
            INSERT INTO users (name, email, password, age, height, weight, fitness_goal, activity_level)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (name, email, hashed_pw, age, height, weight, fitness_goal, activity_level))
        db.commit()
        
        # ✅ Fetch the new user ID
        user_id = cursor.lastrowid

        log(f"[SIGNUP SUCCESS] User added: {email} with ID {user_id}")
        return jsonify({
            "status": "success",
            "user": {
                "id": user_id,
                "name": name,
                "age": age,
                "weight": weight,
                "height": height,
                "goal": fitness_goal,
                "activityLevel": activity_level,
                "email": email
            }
        })

        log(f"[SIGNUP SUCCESS] User added: {email}")
    except mysql.connector.IntegrityError:
        log(f"[SIGNUP FAILED] Email already exists: {email}")
        return jsonify({"status": "error", "message": "Email already exists"})
    except Exception as e:
        log(f"[SIGNUP ERROR] {e}")
        return jsonify({"status": "error", "message": str(e)})


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    # safety check
    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password required"
        })

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    print("USER DATA FROM DB:", user)

    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):

        user_data = {
            "id": user["id"],
            "name": user["name"],
            "age": user["age"],
            "weight": user["weight"],
            "height": user["height"],
            "goal": user["fitness_goal"],
            "activityLevel": user["activity_level"]
        }

        print("LOGIN USER DATA:", user_data)  # debugging

        return jsonify({
            "status": "success",
            "user": user_data
        })

    else:
        return jsonify({
            "status": "error",
            "message": "Invalid credentials"
        })


@app.route("/users", methods=["GET"])
def get_users():
    cursor.execute("SELECT id, name, email FROM users")
    users = cursor.fetchall()
    log(f"[GET USERS] Total users: {len(users)}")
    return jsonify(users)


# ------------------ Predict Endpoint ------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
         
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # If email is provided, fetch user from DB
        email = data.get("email")
        if email:
            cursor.execute(
                "SELECT age, weight, height, fitness_goal, activity_level FROM users WHERE email=%s",
                (email,)
            )
            user = cursor.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

            age = user.get("age")
            weight = user.get("weight")
            height = user.get("height")
            fitness_goal = user.get("fitness_goal")
            activity_level = user.get("activity_level")
        else:
            age = data.get("age")
            weight = data.get("weight")
            height = data.get("height")
            fitness_goal = data.get("fitnessGoal") or data.get("goal")
            if fitness_goal:
                fitness_goal = fitness_goal.lower().replace(" ", "_")
            else:
                return jsonify({"error": "Missing fitness goal"}), 400
            activity_level = data.get("activityLevel") or data.get("activity_level")
            
            print("Predict Input:", age, weight, height, fitness_goal, activity_level, flush=True)

        if age is None or weight is None or height is None:
            return jsonify({"error": "Missing required numeric fields: age, weight, height"}), 400
        age = int(age)
        weight = float(weight)
        height = float(height)

        # Validate categorical fields
        if not fitness_goal or not activity_level:
            return jsonify({"error": "Missing fitnessGoal or activityLevel"}), 400

        fitness_goal = fitness_goal.lower().replace(" ", "_")
        activity_level = activity_level.lower().replace(" ", "_")

        try:

                fitness_goal_encoded = goal_encoder.transform([fitness_goal])[0]
                activity_level_encoded = activity_encoder.transform([activity_level])[0]
        except ValueError:

                return jsonify({"error": "Invalid fitness goal or activity level"}), 400

        input_data = np.array([[age, weight, height, fitness_goal_encoded, activity_level_encoded]])

        fitness_level = clf.predict(input_data)[0]
        workout_duration = reg.predict(input_data)[0]
        
        print("MODEL INPUT:", input_data, flush=True)
        print("MODEL OUTPUT:", fitness_level, workout_duration, flush=True)

        level_map = {0: "Beginner", 1: "Intermediate", 2: "Advanced"}

        return jsonify({
            "fitness_level": level_map.get(int(fitness_level)),
            "recommended_workout": int(workout_duration)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-workout", methods=["POST"])
def generate_workout():
    try:
        data = request.get_json()
        print("WORKOUT API INPUT:", data, flush=True)

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        fitness_level = data.get("fitness_level")
        workout_duration = data.get("recommended_workout")
        activity_level = (data.get("activityLevel") or data.get("activity_level") or "sedentary").lower().replace(" ", "_")
        goal = (data.get("goal") or "weight_loss").lower().replace(" ", "_")

        # ✅ Call new dynamic schedule generator
        schedule = generate_schedule(activity_level, goal, workout_duration)

        if fitness_level is None or workout_duration is None:
            return jsonify({"error": "Missing required fields"}), 400

        return jsonify({
            "fitness_level": fitness_level,
            "recommended_workout": int(workout_duration),
            "goal": goal,
            "schedule": schedule
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route("/bmi", methods=["POST"])
def calculate_bmi():
    try:
        data = request.get_json()
        weight = float(data.get("weight"))
        height = float(data.get("height")) / 100  
        activity = data.get("activity", "sedentary")

        bmi = weight / (height ** 2)

        if bmi < 18.5:
            category = "Underweight"
            color = "yellow"
            advice = "Increase calorie intake with protein-rich diet and strength training."
        elif bmi < 25:
            category = "Normal"
            color = "green"
            advice = "Maintain your current lifestyle, keep exercising regularly."
        elif bmi < 30:
            category = "Overweight"
            color = "orange"
            advice = "Combine cardio and strength training, monitor diet."
        else:
            category = "Obese"
            color = "red"
            advice = "Consult a doctor and start a structured fitness plan."

        # Dynamic advice based on activity
        if activity == "sedentary" and category in ["Overweight", "Obese"]:
            advice += " Try to be more active daily."
        elif activity == "active" and category == "Underweight":
            advice += " Ensure you are eating enough to support your activity."

        ideal_weight_low = 18.5 * (height ** 2)
        ideal_weight_high = 24.9 * (height ** 2)

        return jsonify({
            "bmi": round(bmi, 2),
            "category": category,
            "color": color,
            "advice": advice,
            "ideal_weight_range": f"{round(ideal_weight_low, 1)} - {round(ideal_weight_high, 1)} kg"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route("/feedback", methods=["POST"])
def submit_feedback():
    data = request.json
    user_id_raw = data.get("userId")
    feedback_text = data.get("feedback")

    if not user_id_raw:
        return jsonify({"success": False, "error": "Missing userId"}), 400
    if not feedback_text or feedback_text.strip() == "":
        return jsonify({"success": False, "error": "Feedback text is empty"}), 400

    user_id = int(user_id_raw)

    try:
        cursor = db.cursor()

        # Check duplicate
        cursor.execute("SELECT id FROM feedback WHERE user_id = %s", (user_id,))
        if cursor.fetchone():
            cursor.close()
            return jsonify({"success": False, "error": "Feedback already submitted"}), 400

        # Insert feedback (rating removed)
        cursor.execute(
            "INSERT INTO feedback (user_id, feedback_text) VALUES (%s, %s)",
            (user_id, feedback_text)
        )
        db.commit()
        cursor.close()

        return jsonify({"success": True})

    except Exception as e:
        print("Error saving feedback:", e)
        return jsonify({"success": False, "error": str(e)}), 500


# ------------------ Run Server ------------------
if __name__ == "__main__":
    log("Starting Flask server...")
    app.run(debug=True)
