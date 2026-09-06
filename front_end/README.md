# Road Damage Classification System (CNN Deep Learning)

An interactive, modern, and high-performance web application designed for a **CNN-based Road Damage Classification** final-year engineering project.

The system classifies road surface photographs into three target categories:
1. **Crack**: Surface fissures, alligator cracking, and linear pavement fractures.
2. **Manhole**: Utility covers integrated into road surfaces.
3. **Pothole**: Structural asphalt depressions and severe road hazards.

---

## 🌟 Key Features

- **Cyber-Tech Dark UI Design**: Built with a sleek dark slate obsidian theme, glowing neon accents, and smooth CSS glassmorphism.
- **Interactive Classifier Portal**: Supports drag-and-drop file upload, instant image preview, and preset sample test buttons.
- **Live Visual Analytics**: Displays predicted damage class, overall confidence %, and class probability breakdown via interactive **Chart.js** bar charts and animated progress bars.
- **Diagnostic Action Recommendations**: Automatically suggests maintenance actions based on detected defects.
- **Deep Learning Educational Sections**:
  - **About Project**: Step-by-step pipeline workflow (Upload $\rightarrow$ Preprocessing $\rightarrow$ CNN Feature Extractor $\rightarrow$ Softmax Output).
  - **Model Info**: Simplifies Convolution (Kernel Filters), Pooling (Max Pooling), Feature Extraction, and Softmax activation.
- **Decoupled Backend Integration**: Runs out-of-the-box in **Mock Mode**, with instant 1-line configuration toggle to connect to Flask or FastAPI Python backends.

---

## 📁 Project Directory Structure

```text
road-damage-classification/
├── index.html                    # Main Single Page Application (SPA)
├── css/
│   └── styles.css                # Custom CSS variables, glassmorphism, responsive grid
├── js/
│   ├── api.js                    # API service layer (Mock Mode & Flask/FastAPI handler)
│   └── app.js                    # Drag-and-drop, UI events, Chart.js probability renderer
├── backend_examples/
│   ├── flask_app.py              # Ready-to-use Flask backend template
│   └── fastapi_app.py            # Ready-to-use FastAPI backend template
└── README.md                     # Project documentation & presentation guide
```

---

## 🚀 How to Run the Web Application

### Option A: Running Standalone (Mock Mode - No Backend Required)
1. Open the project folder `road-damage-classification`.
2. Double-click `index.html` to launch directly in any modern web browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, serve with any local server (e.g. `npx serve .` or VS Code Live Server).
4. Click on preset sample buttons (**Crack**, **Manhole**, **Pothole**) or upload your own road photo to see real-time classifications!

---

## 🔌 How to Connect Your Trained TensorFlow / Keras Model

To connect your trained Python model (`road_damage_cnn.h5`):

### Step 1: Start Python Backend
Navigate to `backend_examples/` and run either Flask or FastAPI:

**Using Flask:**
```bash
pip install flask flask-cors tensorflow pillow numpy
python flask_app.py
```

**Using FastAPI:**
```bash
pip install fastapi uvicorn tensorflow pillow numpy python-multipart
uvicorn fastapi_app:app --reload --port 5000
```

### Step 2: Toggle API Mode in Frontend
Open `js/api.js` and change `USE_MOCK` from `true` to `false`:

```javascript
const API_CONFIG = {
    USE_MOCK: false, // Set to false to communicate with Python Backend
    API_URL: 'http://127.0.0.1:5000/predict'
};
```

---

## 🎓 Academic Project Presentation Tips

When presenting this project for your final-year viva/evaluation:
1. **Demonstrate Sample Inputs**: Use the preset test sample buttons on the UI to quickly demonstrate all 3 classes (Crack, Manhole, Pothole).
2. **Explain the CNN Pipeline**: Scroll to the **Workflow** and **Model Info** sections to explain Convolution layers (kernel filters detecting edges), Max Pooling (downsampling), and Softmax activation.
3. **Show Probability Breakdown**: Point out how the Softmax output yields normalized probabilities summing to 100% across the 3 classes.
