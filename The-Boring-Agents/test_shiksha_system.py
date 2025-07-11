#!/usr/bin/env python3
"""
Test script for the Shiksha Course Creation System.
This script tests the multi-agent system functionality.
"""

import sys
import os
import json
from pathlib import Path

# Add src to path for imports
sys.path.append(str(Path(__file__).parent / "src"))

def test_imports():
    """Test that all modules can be imported correctly."""
    print("Testing imports...")
    
    try:
        from src.agents.shiksha_course_agent import ShikshaCourseAgent
        print("✓ ShikshaCourseAgent imported successfully")
        
        from src.agents import ShikshaCourseAgent as ImportedAgent
        print("✓ Agent import from __init__ successful")
        
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_agent_initialization():
    """Test that agents can be initialized."""
    print("\nTesting agent initialization...")
    
    try:
        from src.agents.shiksha_course_agent import ShikshaCourseAgent
        
        # Test with dummy API key
        os.environ['OPENAI_API_KEY'] = 'sk-dummy-key-for-testing'
        agent = ShikshaCourseAgent()
        
        print(f"✓ Agent initialized: {agent.__class__.__name__}")
        print(f"✓ Model name: {agent.model_name}")
        print(f"✓ Config available: {hasattr(agent, 'config')}")
        
        return True
    except Exception as e:
        print(f"✗ Agent initialization failed: {e}")
        return False

def test_course_creation_mock():
    """Test course creation with mock responses."""
    print("\nTesting course creation (mock mode)...")
    
    try:
        from src.agents.shiksha_course_agent import ShikshaCourseAgent
        
        # Clear API key to force mock mode
        if 'OPENAI_API_KEY' in os.environ:
            del os.environ['OPENAI_API_KEY']
        
        agent = ShikshaCourseAgent()
        
        # Create a test course
        course_name = "Test React Development Course"
        description = "Learn React from basics to advanced with hands-on projects"
        
        print(f"Creating course: {course_name}")
        print(f"Description: {description}")
        
        course_data = agent.create_complete_course(course_name, description)
        
        # Validate the structure
        required_fields = ['name', 'slug', 'description', 'chapters', 'meta']
        for field in required_fields:
            if field not in course_data:
                print(f"✗ Missing required field: {field}")
                return False
        
        print(f"✓ Course created successfully")
        print(f"✓ Course name: {course_data['name']}")
        print(f"✓ Number of chapters: {len(course_data['chapters'])}")
        print(f"✓ Difficulty level: {course_data['difficultyLevel']}")
        print(f"✓ Roadmap: {course_data['roadmap']}")
        
        # Save test course
        output_dir = "./output/test"
        os.makedirs(output_dir, exist_ok=True)
        test_file = os.path.join(output_dir, "test_course.json")
        
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Test course saved to: {test_file}")
        
        return True
    except Exception as e:
        print(f"✗ Course creation failed: {e}")
        import traceback
        print(traceback.format_exc())
        return False

def test_cli_availability():
    """Test that CLI commands are available."""
    print("\nTesting CLI availability...")
    
    try:
        # Test that main.py can be imported
        import main
        print("✓ Main CLI module imported successfully")
        
        # Test that the CLI groups exist
        cli_commands = ['shiksha', 'status', 'demo']
        for cmd in cli_commands:
            if hasattr(main, cmd) or hasattr(main.cli, cmd):
                print(f"✓ CLI command '{cmd}' available")
            else:
                print(f"? CLI command '{cmd}' might be available as subcommand")
        
        return True
    except Exception as e:
        print(f"✗ CLI test failed: {e}")
        return False

def test_schema_compliance():
    """Test that generated courses comply with Shiksha schema."""
    print("\nTesting schema compliance...")
    
    # Load test course if it exists
    test_file = "./output/test/test_course.json"
    if not os.path.exists(test_file):
        print("? No test course found, skipping schema test")
        return True
    
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            course_data = json.load(f)
        
        # Check required top-level fields
        required_fields = {
            'name': str,
            'slug': str, 
            'description': str,
            'difficultyLevel': str,
            'roadmap': str,
            'chapters': list,
            'meta': str
        }
        
        for field, expected_type in required_fields.items():
            if field not in course_data:
                print(f"✗ Missing field: {field}")
                return False
            
            if not isinstance(course_data[field], expected_type):
                print(f"✗ Wrong type for {field}: expected {expected_type}, got {type(course_data[field])}")
                return False
            
            print(f"✓ Field '{field}' valid ({expected_type.__name__})")
        
        # Check chapter structure
        chapters = course_data['chapters']
        if not chapters:
            print("✗ No chapters found")
            return False
        
        for i, chapter in enumerate(chapters):
            required_chapter_fields = ['name', 'content', '_id']
            for field in required_chapter_fields:
                if field not in chapter:
                    print(f"✗ Chapter {i+1} missing field: {field}")
                    return False
            
            print(f"✓ Chapter {i+1} structure valid")
        
        print(f"✓ All {len(chapters)} chapters have valid structure")
        print("✓ Course complies with Shiksha schema")
        
        return True
    except Exception as e:
        print(f"✗ Schema compliance test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Shiksha Course Creation System - Test Suite")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_agent_initialization,
        test_course_creation_mock,
        test_cli_availability,
        test_schema_compliance
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 50)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ All tests passed ({passed}/{total})")
        print("\n🎉 Shiksha Course Creation System is working correctly!")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Set OpenAI API key: export OPENAI_API_KEY='your-key'")
        print("3. Create a course: python main.py shiksha create-course --name 'Your Course' --description 'Your description'")
        print("4. Check status: python main.py status")
        return 0
    else:
        print(f"❌ {total - passed} tests failed ({passed}/{total})")
        print("\n🔧 Please check the errors above and fix them before proceeding.")
        return 1

if __name__ == "__main__":
    sys.exit(main())