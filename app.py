from flask import Flask, render_template, request, jsonify, send_file
import numpy as np
import pickle
import sqlite3
import os
import csv
import io
import logging

# Config
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "cyberpunk_bike_predictor_2025")
DB_FILE = 'predictions.db'

# Load actual trained model
model = pickle.load(open('bike_model.pkl', 'rb'))

# Logging
logging.basicConfig(level=logging.INFO)

# Init DB
def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                kms_driven REAL,
                age REAL,
                power REAL,
                owner TEXT,
                brand TEXT,
                predicted_price REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
init_db()

# Brand and owner maps
brand_map = {
    'TVS': 0, 'Royal Enfield': 1, 'Triumph': 2, 'Yamaha': 3, 'Honda': 4,
    'Hero': 5, 'Bajaj': 6, 'Suzuki': 7, 'Benelli': 8, 'KTM': 9,
    'Mahindra': 10, 'Kawasaki': 11, 'Ducati': 12, 'Hyosung': 13,
    'Harley-Davidson': 14, 'Jawa': 15, 'BMW': 16, 'Indian': 17,
    'Rajdoot': 18, 'LML': 19, 'Yezdi': 20, 'MV': 21, 'Ideal': 22
}
owner_map = {
    'First Owner': 1, 'Second Owner': 2,
    'Third Owner': 3, 'Fourth Owner Or More': 4
}

@app.route('/')
def home():
    return render_template('home.html', brand_map=brand_map, owner_map=owner_map)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        kms_driven = float(request.form['kms_driven'])
        age = float(request.form['age'])
        power = float(request.form['power'])
        owner_text = request.form['owner']
        brand_text = request.form['brand']
        owner = owner_map[owner_text]
        brand = brand_map[brand_text]

        features = np.array([[kms_driven, age, power, owner, brand]])
        predicted_price = model.predict(features)[0]
        predicted_price = max(predicted_price, 0)

        with sqlite3.connect(DB_FILE) as conn:
            conn.execute('''
                INSERT INTO predictions (kms_driven, age, power, owner, brand, predicted_price)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (kms_driven, age, power, owner_text, brand_text, predicted_price))

        return jsonify({
            'prediction_text': f"₹{round(predicted_price, 2):,}",
            'success': True
        })
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        return jsonify({'error': str(e), 'success': False})

@app.route('/history')
def history():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        rows_data = [dict(zip(columns, row)) for row in rows]
    return render_template('history.html', rows=rows_data)

@app.route('/download_csv')
def download_csv():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
        rows = cursor.fetchall()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([desc[0] for desc in cursor.description])
        writer.writerows(rows)
        output.seek(0)

        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='prediction_history.csv'
        )

@app.route('/delete_all')
def delete_all():
    with sqlite3.connect(DB_FILE) as conn:
        conn.execute("DELETE FROM predictions")
    return render_template('history.html', rows=[])

if __name__ == '__main__':
    app.run(debug=True)

# from flask import Flask, render_template, request, jsonify, send_file
# import numpy as np
# import pickle
# import sqlite3
# import os
# import csv
# import io
# import logging

# # Configure logging
# logging.basicConfig(level=logging.DEBUG)

# app = Flask(__name__)
# model = pickle.load(open('bike_model.pkl', 'rb'))
# app.secret_key = os.environ.get("SESSION_SECRET", "cyberpunk_bike_predictor_2025")

# DB_FILE = 'predictions.db'

# # Create DB and table if not exists
# def init_db():
#     with sqlite3.connect(DB_FILE) as conn:
#         conn.execute('''
#             CREATE TABLE IF NOT EXISTS predictions (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 kms_driven REAL,
#                 age REAL,
#                 power REAL,
#                 owner TEXT,
#                 brand TEXT,
#                 predicted_price REAL,
#                 timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
#             )
#         ''')
#         conn.commit()

# init_db()

# # Create a simple mock model for demonstration
# class MockModel:
#     def predict(self, features):
#         # Simple price calculation based on features
#         kms_driven, age, power, owner, brand = features[0]
#         base_price = power * 150  # Base price on engine power
#         age_depreciation = age * 8000  # Depreciation per year
#         km_depreciation = kms_driven * 1.2  # Depreciation per km
#         owner_penalty = owner * 15000  # Owner penalty
        
#         # Brand premium (simplified)
#         brand_multiplier = 1.0
#         if brand in [1, 2, 11, 12, 14, 16]:  # Premium brands
#             brand_multiplier = 1.3
#         elif brand in [3, 4, 6, 7, 9]:  # Mid-range brands
#             brand_multiplier = 1.1
        
#         # Calculate final price
#         price = (base_price - age_depreciation - km_depreciation - owner_penalty) * brand_multiplier
        
#         # Ensure minimum price
#         price = max(price, 15000)
#         return [price]

# model = MockModel()
# logging.info("Mock ML model initialized successfully")

# # Dictionaries to map user-friendly names to numeric values
# brand_map = {
#     'TVS': 0, 'Royal Enfield': 1, 'Triumph': 2, 'Yamaha': 3, 'Honda': 4,
#     'Hero': 5, 'Bajaj': 6, 'Suzuki': 7, 'Benelli': 8, 'KTM': 9,
#     'Mahindra': 10, 'Kawasaki': 11, 'Ducati': 12, 'Hyosung': 13,
#     'Harley-Davidson': 14, 'Jawa': 15, 'BMW': 16, 'Indian': 17,
#     'Rajdoot': 18, 'LML': 19, 'Yezdi': 20, 'MV': 21, 'Ideal': 22
# }

# owner_map = {
#     'First Owner': 1,
#     'Second Owner': 2,
#     'Third Owner': 3,
#     'Fourth Owner Or More': 4
# }

# @app.route('/')
# def home():
#     return render_template('home.html', brand_map=brand_map, owner_map=owner_map)

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         kms_driven = float(request.form['kms_driven'])
#         age = float(request.form['age'])
#         power = float(request.form['power'])
#         owner_text = request.form['owner']
#         brand_text = request.form['brand']

#         owner = owner_map[owner_text]
#         brand = brand_map[brand_text]

#         features = np.array([[kms_driven, age, power, owner, brand]])
#         predicted_price = model.predict(features)[0]
#         predicted_price = max(predicted_price, 0)  # No negative predictions

#         # Store in database
#         with sqlite3.connect(DB_FILE) as conn:
#             conn.execute('''
#                 INSERT INTO predictions (kms_driven, age, power, owner, brand, predicted_price)
#                 VALUES (?, ?, ?, ?, ?, ?)
#             ''', (kms_driven, age, power, owner_text, brand_text, predicted_price))
#             conn.commit()

#         return jsonify({
#             'prediction_text': f"₹{round(predicted_price, 2):,}",
#             'success': True
#         })

#     except Exception as e:
#         logging.error(f"Prediction error: {str(e)}")
#         return jsonify({'error': str(e), 'success': False})

# @app.route('/predict_api', methods=['POST'])
# def predict_api():
#     try:
#         data = request.json
#         kms_driven = float(data['kms_driven'])
#         age = float(data['age'])
#         power = float(data['power'])
#         owner_text = data['owner']
#         brand_text = data['brand']

#         owner = owner_map[owner_text]
#         brand = brand_map[brand_text]

#         features = np.array([[kms_driven, age, power, owner, brand]])
#         predicted_price = model.predict(features)[0]
#         predicted_price = max(predicted_price, 0)

#         # Save to DB
#         with sqlite3.connect(DB_FILE) as conn:
#             conn.execute('''
#                 INSERT INTO predictions (kms_driven, age, power, owner, brand, predicted_price)
#                 VALUES (?, ?, ?, ?, ?, ?)
#             ''', (kms_driven, age, power, owner_text, brand_text, predicted_price))
#             conn.commit()

#         return jsonify({'price': round(predicted_price, 2)})

#     except Exception as e:
#         logging.error(f"API prediction error: {str(e)}")
#         return jsonify({'error': str(e)})

# @app.route('/history')
# def history():
#     with sqlite3.connect(DB_FILE) as conn:
#         cursor = conn.cursor()
#         cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
#         rows = cursor.fetchall()
        
#         # Convert to list of dictionaries to avoid Row serialization issues
#         columns = [description[0] for description in cursor.description]
#         rows_data = []
#         for row in rows:
#             row_dict = {}
#             for i, column in enumerate(columns):
#                 row_dict[column] = row[i]
#             rows_data.append(row_dict)
    
#     return render_template('history.html', rows=rows_data)

# @app.route('/history_data')
# def history_data():
#     """API endpoint for chart data"""
#     with sqlite3.connect(DB_FILE) as conn:
#         conn.row_factory = sqlite3.Row
#         rows = conn.execute("SELECT * FROM predictions ORDER BY id DESC LIMIT 50").fetchall()
        
#         data = []
#         for row in rows:
#             data.append({
#                 'id': row['id'],
#                 'brand': row['brand'],
#                 'owner': row['owner'],
#                 'kms_driven': row['kms_driven'],
#                 'age': row['age'],
#                 'power': row['power'],
#                 'predicted_price': row['predicted_price']
#             })
        
#         return jsonify(data)

# @app.route('/delete_all')
# def delete_all():
#     with sqlite3.connect(DB_FILE) as conn:
#         conn.execute("DELETE FROM predictions")
#         conn.commit()
#     return render_template('history.html', rows=[])

# @app.route('/download_csv')
# def download_csv():
#     with sqlite3.connect(DB_FILE) as conn:
#         cursor = conn.cursor()
#         cursor.execute("SELECT * FROM predictions ORDER BY id DESC")
#         rows = cursor.fetchall()

#         output = io.StringIO()
#         writer = csv.writer(output)
#         writer.writerow([description[0] for description in cursor.description])  # headers
#         writer.writerows(rows)

#         output.seek(0)

#         return send_file(
#             io.BytesIO(output.getvalue().encode()),
#             mimetype='text/csv',
#             as_attachment=True,
#             download_name='prediction_history.csv'
#         )

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)
