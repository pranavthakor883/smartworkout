import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import bcrypt
from datetime import datetime
import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder
import random

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ------------------ ML Models ------------------
clf = joblib.load("fitness_level_model.pkl")
reg = joblib.load("workout_duration_model.pkl")    

 
def generate_schedule(activity, goal="weight_loss", recommended_workout=None):

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
            day_exercises.append({"name": ex["name"], "sets": sets, "reps": reps, "completed": False})

        schedule.append({"day": day, "exercises": day_exercises, "completed": False })

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

    # 👇 AUTO ADMIN LOGIC
    if email == "admin@gmail.com":
        role = "admin"
    else:
        role = "user"

    if not email or not password:
        log("[SIGNUP ERROR] Missing required fields")
        return jsonify({"status": "error", "message": "Missing required fields"})

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    from datetime import datetime
    signup_date = datetime.now()

    # Check if user already exists
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        sql = """
            UPDATE users 
            SET name=%s, age=%s, height=%s, weight=%s, 
                fitness_goal=%s, activity_level=%s, role=%s
            WHERE email=%s
        """
        cursor.execute(sql, (name, age, height, weight, fitness_goal, activity_level, role, email))
        db.commit()

        user_id = existing_user["id"]

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
                "role": role,
                "signupDate": signup_date.strftime("%Y-%m-%d %H:%M:%S"),
                "email": email
            }
        })

    try:
        sql = """
            INSERT INTO users (name, email, password, age, height, weight, fitness_goal, activity_level, role, signup_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (name, email, hashed_pw, age, height, weight, fitness_goal, activity_level, role, signup_date))
        db.commit()
        
        user_id = cursor.lastrowid

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
                "role": role,
                "signupDate": signup_date.strftime("%Y-%m-%d %H:%M:%S"),
                "email": email
            }
        })

    except mysql.connector.IntegrityError:
        return jsonify({"status": "error", "message": "Email already exists"})
    except Exception as e:
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
            "email": user["email"],
            "goal": user["fitness_goal"],
            "activityLevel": user["activity_level"],
            "role": user["role"],  # 🔥 ADD THIS
            "signupDate": user["signup_date"].strftime("%Y-%m-%d %H:%M:%S") if isinstance(user.get("signup_date"), datetime) else user.get("signup_date")
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


#-------------------Users----------------------------
#-------------------Users----------------------------
@app.route("/users", methods=["GET"])
def get_users():
    try:
        with db.cursor(dictionary=True) as cursor:
            cursor.execute("""
                SELECT id, name, email, age, weight, height, fitness_goal, activity_level, signup_date
                FROM users
                WHERE role != 'admin'
                ORDER BY signup_date DESC
            """)
            users = cursor.fetchall()

        # Convert signup_date to string
        for u in users:
            if isinstance(u["signup_date"], datetime):
                u["signup_date"] = u["signup_date"].strftime("%Y-%m-%d %H:%M:%S")
            
            # Optional: BMI calculation (tumhare code me already hai)
            try:
                height_m = float(u["height"]) / 100
                weight_kg = float(u["weight"])
                bmi = weight_kg / (height_m ** 2)
                u["bmi"] = round(bmi, 2)
                if bmi < 18.5:
                    u["bmi_category"] = "Underweight"
                elif bmi < 25:
                    u["bmi_category"] = "Normal"
                elif bmi < 30:
                    u["bmi_category"] = "Overweight"
                else:
                    u["bmi_category"] = "Obese"
            except Exception:
                u["bmi"] = None
                u["bmi_category"] = "Unknown"

        return jsonify({"users": users})

    except Exception as e:
        print("[ERROR] Fetching users failed:", e)
        return jsonify({"users": []}), 500

    
#-----------------------delete----------------------------------
@app.route("/delete-user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
            db.commit()
            if cursor.rowcount == 0:
                return jsonify({"status": "error", "error": "User not found"}), 404
        return jsonify({"status": "deleted"})
    except mysql.connector.Error as e:
        # FK ya constraint error
        return jsonify({"status": "error", "error": "Cannot delete user due to related data"}), 400


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
            "recommended_workout": int(workout_duration),
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

        # Check duplicate in feedback table
        cursor.execute("SELECT id FROM feedback WHERE user_id = %s", (user_id,))
        if cursor.fetchone():
            cursor.close()
            return jsonify({"success": False, "error": "Feedback already submitted"}), 400

        # Insert into feedback table
        cursor.execute(
            "INSERT INTO feedback (user_id, feedback_text) VALUES (%s, %s)",
            (user_id, feedback_text)
        )

        # ✅ Update users table
        cursor.execute(
            "UPDATE users SET feedback_submitted = 1 WHERE id = %s",
            (user_id,)
        )

        db.commit()
        cursor.close()

        return jsonify({"success": True})

    except Exception as e:
        print("Error saving feedback:", e)
        return jsonify({"success": False, "error": str(e)}), 500


#-----------------------------------------------------------------
@app.route("/all-feedbacks", methods=["GET"])
def all_feedbacks():
    try:
        # Use a context manager to auto-close cursor
        with db.cursor(dictionary=True) as cursor:
            query = """
                SELECT f.id, f.user_id, f.feedback_text, u.name, u.email
                FROM feedback f
                JOIN users u ON f.user_id = u.id
                ORDER BY f.id DESC
            """
            cursor.execute(query)
            feedbacks = cursor.fetchall()

        # Ensure feedbacks is always a list
        if feedbacks is None:
            feedbacks = []

        return jsonify({"feedbacks": feedbacks})

    except mysql.connector.errors.OperationalError as e:
        # Try to reconnect if connection lost
        try:
            db.ping(reconnect=True, attempts=3, delay=5)
            print("[INFO] Reconnected to DB, please retry the request.")
        except Exception as recon_err:
            print("[ERROR] DB reconnection failed:", recon_err)
        return jsonify({"feedbacks": [], "success": False, "error": "Database connection lost"}), 500

    except mysql.connector.Error as db_err:
        print(f"[DB ERROR] Fetching feedbacks failed: {db_err}")
        return jsonify({"feedbacks": [], "success": False, "error": "Database error occurred"}), 500

    except Exception as e:
        print(f"[ERROR] Fetching feedbacks failed: {e}")
        return jsonify({"feedbacks": [], "success": False, "error": str(e)}), 500

    #--------------------------------------------------------------
@app.route("/delete-feedback/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    try:
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM feedback WHERE id=%s", (feedback_id,))
            db.commit()
        return jsonify({"status": "deleted"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500
#---------------------------------------------------------------------
@app.route("/update-schedule", methods=["POST"])
def update_schedule():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        schedule = data.get("schedule")

        if not user_id or not schedule:
            return jsonify({"error": "Missing user_id or schedule"}), 400

        # ✅ yahan database me update logic likho
        # e.g., UPDATE user_schedule SET schedule = JSON(schedule) WHERE user_id = ...

        return jsonify({"status": "success", "message": "Schedule updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    #--------------------------------------------------------------------
@app.route("/get-user-schedule/<int:user_id>", methods=["GET"])
def get_user_schedule(user_id):
    try:
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT schedule_json FROM user_schedules WHERE user_id = %s", (user_id,))
        row = cursor.fetchone()
        cursor.close()

        if row and row["schedule_json"]:
            schedule = json.loads(row["schedule_json"])  # ✅ string -> JSON
            return jsonify({"schedule": schedule})
        else:
            return jsonify({"schedule": []})
    except Exception as e:
        print("Error fetching schedule:", e)
        return jsonify({"schedule": []})


# ------------------ Run Server ------------------
if __name__ == "__main__":
    log("Starting Flask server...")
    app.run(debug=True)
