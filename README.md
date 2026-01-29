# 🦠 Agario Clone (JavaScript ES6 Modules)

A lightweight, modular clone of the popular game **Agar.io**, built entirely with **Vanilla JavaScript (ES6)** and **HTML5 Canvas**. 

This project demonstrates the transition from a monolithic codebase to a scalable **Modular Architecture**, featuring a custom physics engine, object-oriented entity management, and vector-based collision detection.

## 🚀 Features

* **Modular Architecture:** The codebase is separated into distinct modules (`Physics`, `Renderer`, `State`, `Entities`) for maintainability and scalability.
* **Custom Physics Engine:**
    * **Mitosis (Cell Splitting):** Implements cell division with vector-based velocity and friction.
    * **Cohesion & Gravity:** Split cells are attracted to their center of mass, simulating a "cluster" effect using vector arithmetic.
    * **Elastic Collisions:** Cells push against each other without overlapping (Repulsion logic).
* **Smart Bot AI:** Autonomous bots that roam, hunt for food, grow in size, and engage in combat.
* **Dynamic Camera:** A zoom system that smoothly adapts based on the player's total mass.
* **Optimized Rendering:** Uses the "Painter's Algorithm" (Z-Index sorting) to correctly render smaller cells behind larger ones.

## 🛠️ Tech Stack

* **Language:** JavaScript (ES6+)
* **Rendering:** HTML5 Canvas API
* **Styling:** CSS3
* **Architecture:** Component-Based / Functional Composition

## 📂 Project Structure

```text
├── index.html       # Entry point
├── style.css        # UI Styling
├── game.js          # Main Game Loop & Event Handling
├── state.js         # Centralized State Management (Data Store)
├── physics.js       # Collision Detection, Movement, & Mechanics
├── renderer.js      # Canvas Drawing Logic
├── entities.js      # OOP Classes (Player, Bot, Food, Entity)
├── constants.js     # Global Configuration (Map size, speeds, colors)
└── utils.js         # Helper functions (Random colors, Grid drawing)
🎮 How to RunSince this project uses ES6 Modules (import/export), it requires a local server to run (due to CORS policies).Option 1: VS Code Live Server (Recommended)Open the project folder in VS Code.Install the Live Server extension.Right-click index.html and select "Open with Live Server".Option 2: PythonIf you have Python installed, you can run a simple HTTP server in the project directory:Bash# Python 3
python -m http.server 8000
Then open http://localhost:8000 in your browser.🕹️ ControlsKeyActionMouseMove your cell(s)SpaceSplit into smaller pieces (Launch attack)ESCPause / Resume Game🧠 Engineering HighlightsThe Physics of "Splitting"When a player presses Space, the game calculates a normalized vector towards the mouse cursor. New cells are instantiated with an initial velocity (vx, vy) and subjected to a friction coefficient (0.9) per frame, simulating drag forces.Collision ResolutionTo prevent cells from overlapping visually, a custom repulsion algorithm checks the distance between all player cells ($O(N^2)$ for local cluster). If distance < radiusA + radiusB, a push vector is applied to separate them smoothly.📜 LicenseThis project is open-source and available under the MIT License.Developed by [Alperen] - Software Engineering Student
