<div align="center">

# 🎯 Decision Making Simplex Solver

### *Elegant Linear Programming at Your Fingertips*

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-black.svg?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![NumPy](https://img.shields.io/badge/NumPy-Latest-013243.svg?style=for-the-badge&logo=numpy&logoColor=white)](https://numpy.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

*A beautiful, web-based implementation of the Simplex Algorithm for solving linear programming problems with an intuitive interface and powerful backend.*

[Features](#-features) • [Quick Start](#-quick-start) • [Usage](#-usage) • [Project Structure](#-project-structure) • [Examples](#-examples)

---

</div>

## ✨ Features

- 🎨 **Intuitive Web Interface** - Clean, user-friendly design for easy problem input
- 🔄 **RESTful API** - Well-structured Flask backend with CORS support
- 📊 **Step-by-Step Solutions** - Detailed tableau iterations for learning
- 🎯 **Dual Optimization** - Support for both maximization and minimization problems
- 🧮 **Multiple Constraints** - Handle complex linear programming scenarios

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8 or higher** ([Download Python](https://www.python.org/downloads/))
- **pip** (comes bundled with Python)

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/KorawutMing/DecisionMakingSimplex.git
```

#### 2️⃣ Create Virtual Environment

Creating a virtual environment keeps your project dependencies isolated and clean.

```bash
# Create the virtual environment
python -m venv venv
```

#### 3️⃣ Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

> 💡 **Tip:** You should see `(venv)` appear in your terminal prompt when activated.

#### 4️⃣ Install Dependencies

```bash
pip install flask flask-cors numpy
```

---

## 🛠 Running the Application

**Step 1:** Navigate to the backend directory
```bash
cd backend
```

**Step 2:** Start the Flask server
```bash
python app.py
```

**Step 3:** Open your browser and visit
```
http://127.0.0.1:5000
```

🎉 **Success!** You should now see the Simplex Solver interface ready to use!

---

## 📂 Project Structure

```
DECISIONMAKINGSIMPLEX/
├── 📁 backend/                # Server-side logic
│   ├── 📁 solver/             # Core Simplex mathematical engine
│   │   ├── models.py          # Data models for LP problems
│   │   └── tableau.py         # Simplex tableau transformation logic
│   ├── 📁 utils/              # Logic helpers and utilities
│   │   └── helpers.py         # General utility functions
│   └── 🐍 app.py              # Flask entry point & API routes
│
├── 📁 prototype/              # Research & Development
│   └── 📓 test.ipynb          # Jupyter notebook for logic testing
│
├── 📁 static/                 # Frontend assets
│   ├── 📁 css/                # Stylesheets (styles.css)
│   └── 📁 js/                 # JavaScript functionality
│
├── 📁 templates/              # HTML UI
│   ├── index.html             # Main application interface
│   └── index_old.html         # Deprecated/Backup UI
│
├── 📄 .gitignore              # Files to be ignored by Git
├── 📄 README.md               # Project documentation
├── 📄 samples.txt             # Example inputs for testing
└── 📄 samples_legacy.txt      # Older test cases
```

### 🔍 Key Components

| Component | Purpose |
| :--- | :--- |
| **backend/solver/** | The "brain" of the app; handles the math behind the Simplex algorithm. |
| **backend/app.py** | Bridges the frontend and backend via Flask routes. |
| **static/** | Houses all client-side assets like CSS styling and JS logic. |
| **templates/** | Contains the HTML template rendered by Flask. |
| **prototype/** | A sandbox for experimenting with new solvers or scripts before deployment. |
| **samples.txt** | A collection of linear programming problems for quick copy-pasting. |

## 💡 Usage

### Basic Workflow

1. **Define Your Problem** - Enter objective function and constraints
2. **Choose Optimization Type** - Select maximize or minimize
3. **Solve** - Click to run the Simplex Algorithm
4. **Review Results** - Examine optimal solution and tableau steps

---

## 📊 Examples

Check out `samples.txt` for pre-configured example problems including:

- Production optimization
- Resource allocation
- Diet problems
- Transportation problems
- Assignment problems

---

## 🔧 Development

### Adding New Features

The modular structure makes it easy to extend functionality:

1. **Backend Logic** - Modify files in `solver/` directory
2. **API Endpoints** - Add routes in `app.py`
3. **Frontend** - Update templates in `templates/`
4. **Utilities** - Extend helper functions in `utils/`

### Testing

Use the `prototype/` directory to test new algorithms or logic before integrating into the main application.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Contact

Have questions or suggestions? Feel free to reach out!

---

<div align="center">

**Made with ❤️ and ☕**

⭐ Star this repo if you find it helpful!

[Back to Top](#-decision-making-simplex-solver)

</div>