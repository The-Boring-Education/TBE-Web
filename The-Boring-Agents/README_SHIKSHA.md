# Shiksha Course Creation System

An advanced multi-agent AI system for creating comprehensive tech courses for The Boring Education's Shiksha platform. This system uses multiple specialized AI agents to research, plan, create content, curate videos, design projects, and ensure quality - producing complete courses that follow the "learning by building" methodology.

## 🌟 Features

### 🤖 Multi-Agent Architecture
- **Research Agent**: Thoroughly researches course topics and industry trends
- **Planning Agent**: Creates structured learning paths and course outlines
- **Content Creation Agent**: Generates engaging chapter content with examples and exercises
- **Video Curation Agent**: Finds and recommends high-quality YouTube tutorials
- **Project Design Agent**: Creates hands-on projects that build real-world skills
- **Quality Assurance Agent**: Reviews and validates course content for quality
- **Manager Agent**: Coordinates all agents and formats final output

### 📚 Complete Course Generation
- **Metadata Generation**: Course title, description, difficulty level, roadmap category
- **Structured Chapters**: Theory chapters with clear learning objectives
- **Hands-on Projects**: Progressive projects that build portfolio-worthy applications
- **Video Integration**: Curated YouTube tutorial recommendations
- **Social Media Templates**: Ready-to-use LinkedIn and Twitter posts for learners
- **Assessment Guidelines**: Knowledge checkpoints and practical assignments

### 🎯 Industry-Focused Content
- **Real-world Applications**: Courses designed for practical skills
- **Career-Oriented**: Content aligned with industry demands and job requirements
- **Progressive Learning**: Building from fundamentals to advanced concepts
- **Project-Based**: "Learning by building" methodology throughout

## 🏗️ Architecture

```
ShikshaCourseAgent (Orchestrator)
├── CourseResearchAgent
│   └── Researches topic, industry trends, prerequisites
├── CoursePlanningAgent
│   └── Creates course structure, learning objectives, timelines
├── ChapterContentAgent
│   └── Generates detailed content for each chapter
├── VideoCurationAgent
│   └── Curates YouTube videos and tutorials
├── ProjectDesignAgent
│   └── Designs hands-on projects and assignments
├── QualityAssuranceAgent
│   └── Reviews content for quality and completeness
└── ManagerAgent
    └── Final review and JSON formatting
```

## 🚀 Quick Start

### Installation

1. **Clone and Setup**
```bash
cd The-Boring-Agents
pip install -r requirements.txt
```

2. **Set up API Key**
```bash
export OPENAI_API_KEY='your-openai-api-key-here'
```

3. **Test the System**
```bash
python test_shiksha_system.py
```

### Basic Usage

1. **Create a Complete Course**
```bash
python main.py shiksha create-course \
  --name "Modern React Development" \
  --description "Learn React from basics to advanced with real-world projects"
```

2. **Check System Status**
```bash
python main.py status
```

3. **Run Demo (No API needed)**
```bash
python main.py demo
```

4. **Validate Generated Course**
```bash
python main.py shiksha validate-course ./output/shiksha_courses/your_course.json
```

## 📖 Detailed Usage

### Course Creation Process

The system follows an 8-phase workflow:

1. **Research Phase** - Comprehensive topic research
2. **Planning Phase** - Course structure and learning path design  
3. **Content Creation** - Detailed chapter content generation
4. **Video Curation** - YouTube tutorial recommendations
5. **Project Design** - Hands-on project creation
6. **Quality Assurance** - Content review and validation
7. **Manager Review** - Final formatting and metadata
8. **Output Generation** - JSON file creation in Shiksha format

### Example Commands

```bash
# Create a backend development course
python main.py shiksha create-course \
  --name "Zero to Hero Backend with Node.js" \
  --description "Complete backend development course with APIs, databases, and deployment"

# Create a frontend course
python main.py shiksha create-course \
  --name "Modern Frontend with React" \
  --description "Build modern web applications with React, TypeScript, and Next.js"

# Create a full-stack course
python main.py shiksha create-course \
  --name "Full-Stack MERN Development" \
  --description "End-to-end web development with MongoDB, Express, React, and Node.js"
```

### Output Structure

Generated courses follow the Shiksha JSON schema:

```json
{
  "name": "Course Title",
  "slug": "course-slug",
  "description": "Course description",
  "difficultyLevel": "Beginner|Intermediate|Advanced",
  "roadmap": "Backend|Frontend|FullStack|DevOps|Mobile|Programming",
  "chapters": [
    {
      "name": "Chapter Title",
      "content": "# Markdown content with tutorials, projects, and social templates",
      "_id": "unique-chapter-id",
      "createdAt": "2025-01-29T12:00:00.000Z",
      "updatedAt": "2025-01-29T12:00:00.000Z"
    }
  ],
  "meta": "# Course introduction and overview in markdown",
  "createdAt": "2025-01-29T12:00:00.000Z",
  "updatedAt": "2025-01-29T12:00:00.000Z"
}
```

## 🎯 Content Quality Features

### Chapter Structure
Each chapter follows a proven template:
- **Why Do We Need [Topic]?** - Importance and relevance
- **How Important Is It?** - Industry significance
- **How Long Will It Take?** - Realistic time estimates
- **Tutorial Section** - Curated video recommendations
- **Detailed Content** - Concepts, examples, best practices
- **Social Media Templates** - LinkedIn and Twitter posts

### Project Integration
- Progressive difficulty curve
- Real-world applications
- Portfolio-worthy outcomes
- GitHub repository setup guidance
- Industry-relevant technologies

### Quality Assurance
- Content accuracy validation
- Learning flow optimization
- Industry relevance checking
- Accessibility assessment
- Completeness verification

## ⚙️ Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional
LOG_LEVEL=INFO
OUTPUT_DIR=./output/shiksha_courses
MODEL_NAME=gpt-3.5-turbo
TEMPERATURE=0.7
MAX_TOKENS=2000
```

### Customization Options
- Model selection (GPT-3.5, GPT-4, etc.)
- Temperature and creativity settings
- Output directory configuration
- Custom prompt templates
- Agent-specific configurations

## 🧪 Testing

### Run All Tests
```bash
python test_shiksha_system.py
```

### Test Coverage
- Import validation
- Agent initialization
- Course creation (mock mode)
- CLI functionality
- Schema compliance
- Output validation

### Mock Mode
The system works without API keys in mock mode:
- Generates template responses
- Tests system architecture
- Validates output structure
- Allows development without costs

## 📁 Project Structure

```
The-Boring-Agents/
├── src/
│   └── agents/
│       ├── __init__.py
│       └── shiksha_course_agent.py    # Multi-agent system
├── main.py                            # CLI interface
├── test_shiksha_system.py            # Test suite
├── requirements.txt                   # Dependencies
├── README_SHIKSHA.md                 # This file
└── output/
    └── shiksha_courses/              # Generated courses
```

## 🔧 Development

### Adding New Agents
1. Extend the `BaseAgent` class
2. Implement `_get_prompt_templates()`
3. Add specific functionality methods
4. Integrate with `ShikshaCourseAgent`

### Customizing Content
- Modify prompt templates for different styles
- Adjust chapter structures
- Add new content types
- Customize project templates

### Integration
- REST API wrapper for web integration
- Batch processing capabilities
- Custom output formats
- Database integration

## 🚀 Production Usage

### Best Practices
1. **API Key Management**: Use environment variables, rotate keys regularly
2. **Rate Limiting**: Implement delays for high-volume usage
3. **Quality Review**: Always review generated content before publishing
4. **Customization**: Adapt prompts for your specific needs
5. **Backup**: Keep generated courses in version control

### Scaling Considerations
- Parallel course generation
- Caching for repeated topics
- Custom model fine-tuning
- Integration with existing platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

## 📞 Support

For questions and support:
- 📧 Technical issues: Create GitHub issues
- 💬 Community: Join The Boring Education Discord
- 📖 Documentation: Check the main README.md

## 🎉 Example Generated Content

Here's what the system generates for a chapter:

```markdown
# Node.js Fundamentals

### Why Do We Need Node.js?
Node.js allows JavaScript to run on the server, making it possible to build scalable, high-performance backend applications. It's the backbone for handling data, managing APIs, and creating dynamic web applications.

### How Important Is It?
Node.js is one of the most in-demand backend technologies today. Whether you're building REST APIs, real-time chat applications, or e-commerce platforms, Node.js provides the speed and efficiency needed for modern applications.

### How Long Will It Take to Learn?
You can grasp the fundamentals of Node.js in 7-10 days with consistent practice, dedicating 2-3 hours/day.

## Tutorial
[Curated video recommendations with specific search guidance]

## Content
[Detailed explanations with code examples, best practices, and real-world applications]

## Share It On Social Media
### LinkedIn
```
🚀 Just kicked off my backend development journey with Node.js Fundamentals!
[Professional post template with achievements and learning outcomes]
```

### Twitter
```
🚀 Started my backend journey with Node.js Fundamentals!
[Concise tweet template with key learning points]
```
```

---

**Built with ❤️ for The Boring Education Community**

*Empowering developers through AI-powered education*