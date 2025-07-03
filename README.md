# bike_price_prediction
# 🏍️ Used Bike Price Predictor

This is a **Machine Learning-powered web application** that predicts the **resale price of used bikes** based on key inputs such as kilometers driven, bike age, engine power, ownership history, and brand.

🚀 **Live Demo:** [https://bike-price-prediction-jkhd.onrender.com/]

---

## 📌 Features

- 🔢 Predicts price based on real input values
- 📊 Stores prediction history in SQLite database
- 📥 Download history as CSV
- 📈 API endpoint for external integration
- 💻 Beautiful modern UI (AI-assisted design)
- ☁️ Deployed using [Render](https://render.com)

---

## 🧠 Machine Learning

- **Model:** Trained using Python & scikit-learn
- **Input Features:**
  - `Kms Driven`
  - `Bike Age`
  - `Engine Power`
  - `Owner History`
  - `Brand`
- **Output:** Predicted price (₹)

---

## 🛠️ Tech Stack

| Layer         | Technology             |
|---------------|------------------------|
| Backend       | Flask                  |
| ML Model      | Scikit-learn, Pickle   |
| Frontend      | HTML, CSS (AI-assisted)|
| Database      | SQLite                 |
| Deployment    | Render                 |

---

## 📷 Screenshots

### 🏠 Homepage
![Homepage](screenshots/home.png)

### 📈 Prediction Result
![Prediction](screenshots/predict.png)

### 🗂️ Prediction History
![History](screenshots/history.png)

---
## 📜 License

This project is licensed under the [**MIT License**](LICENSE).

## 🧪 How to Run Locally

1. **Clone the repo**
```bash
git clone https://github.com/your-username/bike-price-predictor.git
cd bike-price-predictor
