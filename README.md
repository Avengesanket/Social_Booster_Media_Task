# 🌦️ Weather Web Application

A Django-based weather application with Supabase integration, featuring CRUD operations, data visualization, and real-time weather data fetching.
Link 🔗  https://weather-app-9veh.onrender.com

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Supabase account (free tier works)
- OpenWeatherMap API key (free tier works)

## 🧩 Step-by-Step Setup Instructions

### **Step 1: Install Python and pip**

#### Windows:

1. Download Python from [python.org/downloads](https://www.python.org/downloads/)
2. During installation, check **“Add Python to PATH”**
3. Verify installation:
   ```bash
   python --version
   pip --version
   ```

#### macOS/Linux:

```bash
# macOS (using Homebrew)
brew install python3


# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip


# Verify
python3 --version
pip3 --version
```

### **Step 2: Create Project Directory**

```bash
mkdir weather_project
cd weather_project
```

### **Step 3: Create Virtual Environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate


# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### **Step 4: Create Project Structure**

```bash
# Create main directories
mkdir weather_project weatherapp
mkdir weatherapp/static weatherapp/templates weatherapp/migrations
mkdir weatherapp/static/weatherapp weatherapp/templates/weatherapp


# Create __init__.py files
touch weather_project/__init__.py
touch weatherapp/__init__.py
touch weatherapp/migrations/__init__.py
```

### **Step 5: Create requirements.txt**

```bash
Django>=4.2
djangorestframework
psycopg2-binary
python-dotenv
dj-database-url
requests
```

### **Step 6: Install Dependencies**

```bash
pip install -r requirements.txt
```

### **Step 7: Get Supabase Database URL**

1. Go to https://supabase.com and sign up/login

2. Create a new project

3. Wait for the project to be ready (2–3 minutes)

4. Go to Settings → Database → Connection String → URI

5. Copy the connection string format:
   postgresql://postgres:[password]@[host]:5432/postgres

### **Step 8: Get OpenWeatherMap API Key**

1. Go to https://openweathermap.org/api

2. Sign up for a free account

3. Go to API Keys section

4. Copy your API key (looks like: abc123def456...)

⏳ Note: It may take 10–15 minutes for the key to activate.

### **Step 9: Create .env File**

Create a .env file in the root directory:

```bash
# Supabase Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres


# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost


# OpenWeatherMap API
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

🧠 Generate a secure Django secret key:

```
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### **Step 10: Create Database Tables**

```bash
# Make migrations
python manage.py makemigrations


# Apply migrations
python manage.py migrate

```

### **Step 11: Run the Development Server**

```
python manage.py runserver
```

### **Step 12: Access the Application**

- 🏠 Home: http://127.0.0.1:8000/
- 📊 Dashboard: http://127.0.0.1:8000/dashboard/
- ⚙️ API Endpoint: http://127.0.0.1:8000/api/citytemps/

## 💡 How to Use

## Adding Cities

- Go to Home page
- Type a city name (e.g., “London”)
- Click “Fetch Current Weather” to get live temperature
- Click “Save” to store it in the database
  City suggestions appear as you type (from saved cities)

## Viewing Dashboard

- Go to Dashboard page
- See all saved cities in table format
- View temperature chart (last 20 cities)
- See summary statistics
- Edit or delete records using action buttons
- Download CSV export
