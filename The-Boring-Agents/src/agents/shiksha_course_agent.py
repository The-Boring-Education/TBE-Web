"""
Shiksha Course Creation Agent - Multi-agent system for creating comprehensive tech courses.

This agent orchestrates multiple specialized agents to create complete tech courses
including chapters, content, videos, projects, and assessments.
"""

from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime
import logging
import uuid

try:
    from langchain.prompts import PromptTemplate
    from langchain.llms.base import LLM
    from langchain_openai import ChatOpenAI
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("Warning: Langchain not available. Install with: pip install langchain langchain-openai")
    LANGCHAIN_AVAILABLE = False
    # Provide mock classes for development
    class PromptTemplate:
        def __init__(self, input_variables, template):
            self.input_variables = input_variables
            self.template = template
        
        def format(self, **kwargs):
            return self.template.format(**kwargs)
    
    class LLM:
        pass
    
    class ChatOpenAI:
        pass


class MockConfig:
    """Mock configuration class for development."""
    def __init__(self):
        self.output_dir = './output'
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.temperature = 0.7
        self.max_tokens = 2000


class BaseAgent:
    """Basic agent implementation for course creation."""
    
    def __init__(self, **kwargs):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.model_name = kwargs.get('model_name', 'gpt-3.5-turbo')
        self.prompt_templates = self._get_prompt_templates()
        self.config = MockConfig()
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        """Get prompt templates - to be overridden by subclasses."""
        return {}
    
    def _format_prompt(self, template_name: str, **kwargs) -> str:
        """Format a prompt template with given parameters."""
        if template_name not in self.prompt_templates:
            raise ValueError(f"Template '{template_name}' not found")
        
        template = self.prompt_templates[template_name]
        return template.format(**kwargs)
    
    def _generate_with_prompt(self, prompt: str) -> str:
        """Generate content using the language model."""
        if not LANGCHAIN_AVAILABLE or not self.config.openai_api_key:
            # Return a mock response for development
            return f"[MOCK RESPONSE] Content generated for prompt: {prompt[:100]}..."
        
        try:
            # Initialize LLM if available
            llm = ChatOpenAI(
                model=self.model_name,
                api_key=self.config.openai_api_key,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            return llm.predict(prompt)
        except Exception as e:
            self.logger.error(f"Error generating content: {str(e)}")
            return f"[ERROR] Failed to generate content: {str(e)}"


class ShikshaCourseAgent(BaseAgent):
    """Main orchestrator agent for creating complete Shiksha tech courses."""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.research_agent = CourseResearchAgent(**kwargs)
        self.planning_agent = CoursePlanningAgent(**kwargs)
        self.content_agent = ChapterContentAgent(**kwargs)
        self.video_agent = VideoCurationAgent(**kwargs)
        self.project_agent = ProjectDesignAgent(**kwargs)
        self.qa_agent = QualityAssuranceAgent(**kwargs)
        self.manager_agent = ManagerAgent(**kwargs)
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        """Get prompt templates for course orchestration."""
        return {
            "orchestration": PromptTemplate(
                input_variables=["course_name", "description", "research_data"],
                template="""
                As the Shiksha Course Orchestrator, coordinate the creation of a comprehensive tech course.
                
                Course: {course_name}
                Description: {description}
                Research Data: {research_data}
                
                Provide a high-level execution plan for creating this course with:
                1. Learning objectives
                2. Target audience 
                3. Prerequisites
                4. Estimated timeline
                5. Key topics to cover
                6. Project ideas overview
                """
            )
        }
    
    def create_complete_course(self, course_name: str, description: str) -> Dict[str, Any]:
        """Create a complete Shiksha course using the multi-agent workflow."""
        
        self.logger.info(f"Starting course creation for: {course_name}")
        
        # Step 1: Research
        self.logger.info("Phase 1: Research")
        research_data = self.research_agent.research_topic(course_name, description)
        
        # Step 2: Planning
        self.logger.info("Phase 2: Planning")
        course_plan = self.planning_agent.create_course_plan(
            course_name, description, research_data
        )
        
        # Step 3: Content Creation
        self.logger.info("Phase 3: Content Creation")
        chapters = []
        for chapter_plan in course_plan['chapters']:
            chapter_content = self.content_agent.create_chapter_content(
                chapter_plan, course_name, research_data
            )
            chapters.append(chapter_content)
        
        # Step 4: Video Curation
        self.logger.info("Phase 4: Video Curation")
        for chapter in chapters:
            curated_videos = self.video_agent.curate_videos_for_chapter(
                chapter, course_name
            )
            chapter['curated_videos'] = curated_videos
        
        # Step 5: Project Design
        self.logger.info("Phase 5: Project Design")
        project_chapters = self.project_agent.design_projects(
            course_name, course_plan, chapters
        )
        chapters.extend(project_chapters)
        
        # Step 6: Quality Assurance
        self.logger.info("Phase 6: Quality Assurance")
        qa_results = self.qa_agent.review_course(course_name, course_plan, chapters)
        
        # Step 7: Manager Review
        self.logger.info("Phase 7: Manager Review")
        final_course = self.manager_agent.final_review_and_format(
            course_name, description, course_plan, chapters, qa_results
        )
        
        # Step 8: Save JSON
        self.logger.info("Phase 8: Saving Course")
        filename = self._generate_course_filename(course_name)
        self.save_course_json(final_course, filename)
        
        self.logger.info(f"Course creation completed: {filename}")
        return final_course
    
    def _generate_course_filename(self, course_name: str) -> str:
        """Generate a filename for the course."""
        safe_name = course_name.lower().replace(' ', '_').replace('-', '_')
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"shiksha_course_{safe_name}_{timestamp}"
    
    def save_course_json(self, course_data: Dict[str, Any], filename: str) -> str:
        """Save the course data in Shiksha JSON format."""
        # Create output directory if it doesn't exist
        output_dir = os.path.join(self.config.output_dir, "shiksha_courses")
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, f"{filename}.json")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(course_data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Course saved to: {filepath}")
        return filepath


class CourseResearchAgent(BaseAgent):
    """Agent for researching course topics thoroughly."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "research": PromptTemplate(
                input_variables=["course_name", "description"],
                template="""
                You are a Tech Course Research Expert. Research the topic "{course_name}" thoroughly.
                
                Description: {description}
                
                Provide comprehensive research including:
                1. Technology Overview and Importance
                2. Current Industry Demand and Salary Ranges
                3. Prerequisites and Learning Path
                4. Key Concepts and Topics to Cover
                5. Popular Tools and Frameworks
                6. Real-world Applications
                7. Career Opportunities
                8. Best Learning Resources
                9. Common Challenges for Learners
                10. Project Ideas and Practical Applications
                
                Focus on creating a course that follows "learning by building" philosophy.
                Make it suitable for both students and working professionals.
                """
            )
        }
    
    def research_topic(self, course_name: str, description: str) -> Dict[str, Any]:
        """Research the course topic comprehensively."""
        prompt = self._format_prompt("research", course_name=course_name, description=description)
        research_content = self._generate_with_prompt(prompt)
        
        return {
            "course_name": course_name,
            "research_content": research_content,
            "timestamp": datetime.now().isoformat()
        }


class CoursePlanningAgent(BaseAgent):
    """Agent for planning the course structure and learning path."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "planning": PromptTemplate(
                input_variables=["course_name", "description", "research_data"],
                template="""
                You are a Course Planning Expert. Create a detailed course plan for "{course_name}".
                
                Description: {description}
                Research Data: {research_data}
                
                Create a structured course plan with:
                
                1. **Course Metadata:**
                   - Course title
                   - Difficulty level (Beginner/Intermediate/Advanced)
                   - Estimated duration
                   - Target audience
                   - Prerequisites
                
                2. **Learning Objectives:**
                   - 5-7 clear learning outcomes
                   - Skills students will acquire
                
                3. **Chapter Structure (8-15 chapters):**
                   For each chapter provide:
                   - Chapter name
                   - Learning objectives
                   - Key topics to cover
                   - Estimated time to complete
                   - Type (theory/project/assessment)
                
                4. **Project Integration:**
                   - Identify 3-5 hands-on projects
                   - Map projects to relevant chapters
                   - Ensure progressive skill building
                
                5. **Assessment Strategy:**
                   - Knowledge checkpoints
                   - Practical assignments
                   - Final project requirements
                
                Focus on practical, industry-relevant skills with real-world applications.
                """
            )
        }
    
    def create_course_plan(self, course_name: str, description: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a comprehensive course plan."""
        prompt = self._format_prompt(
            "planning", 
            course_name=course_name, 
            description=description, 
            research_data=research_data['research_content']
        )
        plan_content = self._generate_with_prompt(prompt)
        
        return {
            "course_name": course_name,
            "plan_content": plan_content,
            "timestamp": datetime.now().isoformat(),
            "chapters": self._extract_chapter_structure(plan_content)
        }
    
    def _extract_chapter_structure(self, plan_content: str) -> List[Dict[str, Any]]:
        """Extract chapter structure from the plan content."""
        # This is a simplified extraction - could be enhanced with better parsing
        chapters = []
        lines = plan_content.split('\n')
        
        current_chapter = None
        for line in lines:
            line = line.strip()
            if line.startswith('Chapter') or line.startswith('#'):
                if current_chapter:
                    chapters.append(current_chapter)
                current_chapter = {
                    "name": line.replace('#', '').strip(),
                    "type": "theory",
                    "objectives": []
                }
            elif current_chapter and line.startswith('-'):
                current_chapter["objectives"].append(line[1:].strip())
        
        if current_chapter:
            chapters.append(current_chapter)
        
        return chapters


class ChapterContentAgent(BaseAgent):
    """Agent for creating detailed chapter content."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "chapter_content": PromptTemplate(
                input_variables=["chapter_name", "chapter_objectives", "course_name", "research_data"],
                template="""
                You are a Tech Content Creation Expert. Create engaging, comprehensive content for this chapter.
                
                Chapter: {chapter_name}
                Objectives: {chapter_objectives}
                Course: {course_name}
                Research Context: {research_data}
                
                Create content in this exact format (use markdown):
                
                # {chapter_name}
                
                ### Why Do We Need [Topic]?
                [Explain importance and real-world relevance]
                
                ### How Important Is It?
                [Industry significance, career impact]
                
                ### How Long Will It Take to Learn?
                [Realistic time estimates]
                
                ## Tutorial
                [Include placeholder for YouTube tutorial - will be filled by video agent]
                
                ## Content
                [Detailed explanation with:]
                - Key concepts with examples
                - Code snippets where relevant
                - Best practices and tips
                - Common pitfalls to avoid
                - Real-world applications
                - Practical exercises
                
                ## Share It On Social Media
                [Include LinkedIn and Twitter templates for learners to share progress]
                
                ### LinkedIn
                ```
                [Professional post template]
                ```
                
                ### Twitter
                ```
                [Concise tweet template]
                ```
                
                Make content engaging, practical, and focused on "learning by building".
                Include specific examples and actionable advice.
                """
            )
        }
    
    def create_chapter_content(self, chapter_plan: Dict[str, Any], course_name: str, research_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed content for a chapter."""
        prompt = self._format_prompt(
            "chapter_content",
            chapter_name=chapter_plan["name"],
            chapter_objectives=", ".join(chapter_plan.get("objectives", [])),
            course_name=course_name,
            research_data=research_data['research_content']
        )
        
        content = self._generate_with_prompt(prompt)
        
        return {
            "name": chapter_plan["name"],
            "content": content,
            "_id": self._generate_chapter_id(),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
    
    def _generate_chapter_id(self) -> str:
        """Generate a unique chapter ID."""
        import uuid
        return str(uuid.uuid4())[:24]  # MongoDB-style ID


class VideoCurationAgent(BaseAgent):
    """Agent for curating YouTube tutorials and videos."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "video_curation": PromptTemplate(
                input_variables=["chapter_name", "chapter_content", "course_name"],
                template="""
                You are a Video Curation Expert. Find the best YouTube tutorials for this chapter.
                
                Chapter: {chapter_name}
                Course: {course_name}
                Chapter Content: {chapter_content}
                
                Recommend 1-2 high-quality YouTube videos that:
                1. Are recent (published within last 2 years)
                2. Have good engagement (views, likes, comments)
                3. Are concise but comprehensive (10-30 minutes ideal)
                4. Match the chapter's learning objectives
                5. Are from reputable creators
                
                For each video provide:
                - Suggested search terms to find similar content
                - Why this type of video would be valuable
                - What the video should cover
                - Ideal duration range
                - Quality indicators to look for
                
                Format as a tutorial section that can be integrated into the chapter content.
                Include specific guidance on what makes a good tutorial for this topic.
                """
            )
        }
    
    def curate_videos_for_chapter(self, chapter: Dict[str, Any], course_name: str) -> Dict[str, Any]:
        """Curate videos for a specific chapter."""
        prompt = self._format_prompt(
            "video_curation",
            chapter_name=chapter["name"],
            chapter_content=chapter["content"][:500],  # Truncate for context
            course_name=course_name
        )
        
        video_suggestions = self._generate_with_prompt(prompt)
        
        return {
            "suggestions": video_suggestions,
            "timestamp": datetime.now().isoformat()
        }


class ProjectDesignAgent(BaseAgent):
    """Agent for designing hands-on projects."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "project_design": PromptTemplate(
                input_variables=["course_name", "course_plan", "existing_chapters"],
                template="""
                You are a Project Design Expert. Create hands-on projects for this course.
                
                Course: {course_name}
                Course Plan: {course_plan}
                Existing Chapters: {existing_chapters}
                
                Design 3-5 progressive projects that:
                1. Build on concepts from previous chapters
                2. Are practical and industry-relevant
                3. Can be completed in 1-3 hours each
                4. Include clear requirements and outcomes
                5. Have social media sharing templates
                
                For each project create a complete chapter with:
                - Project title and description
                - Learning objectives
                - Requirements and setup
                - Step-by-step guidance
                - Expected outcomes
                - Extension ideas
                - GitHub repository setup instructions
                - Social media templates
                
                Projects should follow the same format as regular chapters but focus on building.
                Make them progressively challenging and portfolio-worthy.
                """
            )
        }
    
    def design_projects(self, course_name: str, course_plan: Dict[str, Any], chapters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Design project chapters for the course."""
        prompt = self._format_prompt(
            "project_design",
            course_name=course_name,
            course_plan=str(course_plan)[:1000],
            existing_chapters=str([ch["name"] for ch in chapters])
        )
        
        projects_content = self._generate_with_prompt(prompt)
        
        # Parse the projects content into separate chapters
        project_chapters = self._parse_project_chapters(projects_content)
        
        return project_chapters
    
    def _parse_project_chapters(self, projects_content: str) -> List[Dict[str, Any]]:
        """Parse the generated projects into separate chapter objects."""
        # Simplified parsing - split by project markers
        chapters = []
        sections = projects_content.split('# Project')
        
        for i, section in enumerate(sections[1:], 1):  # Skip first empty section
            chapter = {
                "name": f"Project {i}: {section.split('\n')[0].strip()}",
                "content": f"# Project {i}: {section}",
                "_id": self._generate_chapter_id(),
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            chapters.append(chapter)
        
        return chapters
    
    def _generate_chapter_id(self) -> str:
        """Generate a unique chapter ID."""
        import uuid
        return str(uuid.uuid4())[:24]


class QualityAssuranceAgent(BaseAgent):
    """Agent for reviewing and improving course quality."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "qa_review": PromptTemplate(
                input_variables=["course_name", "course_plan", "chapters_summary"],
                template="""
                You are a Quality Assurance Expert for educational content. Review this course for quality and completeness.
                
                Course: {course_name}
                Plan: {course_plan}
                Chapters: {chapters_summary}
                
                Evaluate the course on:
                1. **Content Quality**: Clear, accurate, engaging
                2. **Learning Flow**: Logical progression, proper pacing
                3. **Practical Application**: Hands-on projects, real-world relevance
                4. **Completeness**: All topics covered adequately
                5. **Accessibility**: Suitable for target audience
                6. **Industry Relevance**: Up-to-date, market-relevant skills
                
                Provide:
                1. Overall quality score (1-10)
                2. Strengths of the course
                3. Areas for improvement
                4. Specific recommendations
                5. Missing elements (if any)
                6. Suggestions for enhancement
                
                Focus on ensuring the course follows "learning by building" methodology
                and prepares students for real-world applications.
                """
            )
        }
    
    def review_course(self, course_name: str, course_plan: Dict[str, Any], chapters: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Review the entire course for quality and completeness."""
        chapters_summary = "\n".join([f"- {ch['name']}" for ch in chapters])
        
        prompt = self._format_prompt(
            "qa_review",
            course_name=course_name,
            course_plan=str(course_plan)[:1000],
            chapters_summary=chapters_summary
        )
        
        review_content = self._generate_with_prompt(prompt)
        
        return {
            "review_content": review_content,
            "timestamp": datetime.now().isoformat(),
            "reviewed_chapters": len(chapters)
        }


class ManagerAgent(BaseAgent):
    """Manager agent for final review and formatting."""
    
    def _get_prompt_templates(self) -> Dict[str, PromptTemplate]:
        return {
            "final_review": PromptTemplate(
                input_variables=["course_name", "description", "qa_results"],
                template="""
                You are the Course Manager. Provide final review and create course metadata.
                
                Course: {course_name}
                Description: {description}
                QA Results: {qa_results}
                
                Create the final course metadata including:
                1. **Course Introduction/Meta Text** (markdown format)
                2. **Difficulty Level** (Beginner/Intermediate/Advanced)
                3. **Estimated Duration** 
                4. **Target Audience**
                5. **Prerequisites**
                6. **Learning Outcomes**
                7. **Course Description** (engaging, professional)
                8. **Roadmap Category** (Frontend/Backend/FullStack/DevOps/etc.)
                
                The meta text should be engaging and explain:
                - What the course covers
                - Why it's valuable
                - Career opportunities
                - Time commitment
                - What makes this course special
                
                Format as a professional course introduction that motivates learners.
                """
            )
        }
    
    def final_review_and_format(self, course_name: str, description: str, course_plan: Dict[str, Any], 
                               chapters: List[Dict[str, Any]], qa_results: Dict[str, Any]) -> Dict[str, Any]:
        """Perform final review and format the course in Shiksha JSON format."""
        
        # Generate final metadata
        prompt = self._format_prompt(
            "final_review",
            course_name=course_name,
            description=description,
            qa_results=qa_results['review_content']
        )
        
        meta_content = self._generate_with_prompt(prompt)
        
        # Create slug from course name
        slug = course_name.lower().replace(' ', '-').replace('/', '-')
        
        # Format in Shiksha schema
        final_course = {
            "name": course_name,
            "slug": slug,
            "coverImageURL": f"https://ik.imagekit.io/tbe/webapp/shiksha-{slug}-cover.svg",
            "description": description,
            "liveOn": datetime.now().isoformat(),
            "roadmap": self._determine_roadmap(course_name, description),
            "difficultyLevel": self._determine_difficulty(course_plan, meta_content),
            "chapters": chapters,
            "meta": meta_content,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "__v": 0
        }
        
        return final_course
    
    def _determine_roadmap(self, course_name: str, description: str) -> str:
        """Determine the roadmap category based on course content."""
        course_text = f"{course_name} {description}".lower()
        
        if any(word in course_text for word in ['backend', 'api', 'server', 'node', 'express', 'database']):
            return "Backend"
        elif any(word in course_text for word in ['frontend', 'react', 'vue', 'angular', 'html', 'css', 'javascript']):
            return "Frontend"
        elif any(word in course_text for word in ['fullstack', 'full-stack', 'mern', 'mean']):
            return "FullStack"
        elif any(word in course_text for word in ['devops', 'docker', 'kubernetes', 'aws', 'cloud']):
            return "DevOps"
        elif any(word in course_text for word in ['mobile', 'android', 'ios', 'react native', 'flutter']):
            return "Mobile"
        else:
            return "Programming"
    
    def _determine_difficulty(self, course_plan: Dict[str, Any], meta_content: str) -> str:
        """Determine difficulty level from course content."""
        content = f"{course_plan} {meta_content}".lower()
        
        if any(word in content for word in ['beginner', 'introduction', 'basics', 'fundamentals', 'getting started']):
            return "Beginner"
        elif any(word in content for word in ['advanced', 'expert', 'professional', 'mastery']):
            return "Advanced"
        else:
            return "Intermediate"


def generate_content(self, content_type: str = "complete_course", **kwargs) -> Dict[str, Any]:
    """Generate a complete Shiksha course."""
    course_name = kwargs.get("course_name")
    description = kwargs.get("description", "")
    
    if not course_name:
        raise ValueError("course_name is required")
    
    return self.create_complete_course(course_name, description)