# Quick Start Guide - Shiksha Course Creation

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
cd The-Boring-Agents
pip install -r requirements.txt
```

### 2. Set API Key (Optional)
```bash
export OPENAI_API_KEY='your-openai-api-key-here'
```
*Note: System works in mock mode without API key*

### 3. Test the System
```bash
python3 test_shiksha_system.py
```

### 4. Create Your First Course
```bash
python3 main.py shiksha create-course \
  --name "Python Web Development" \
  --description "Learn Python web development with Flask and Django"
```

## 📁 Output Location
Your generated course will be saved in:
```
./output/shiksha_courses/shiksha_course_python_web_development_TIMESTAMP.json
```

## 🔍 Validate Generated Course
```bash
python3 main.py shiksha validate-course ./output/shiksha_courses/your_course.json
```

## ✅ System Status Check
```bash
python3 main.py status
```

## 🎬 Run Demo (No API needed)
```bash
python3 main.py demo
```

## 🆘 Need Help?
- Read: `README_SHIKSHA.md` for comprehensive documentation
- Check: `SHIKSHA_SYSTEM_SUMMARY.md` for technical details
- Test: `python3 test_shiksha_system.py` to diagnose issues

---

**You're all set! Start creating amazing tech courses! 🎉**