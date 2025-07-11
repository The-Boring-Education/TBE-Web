"""Agents module for The Boring Agents."""

try:
    from .content_agent import ContentAgent
    from .interview_agent import InterviewAgent  
    from .project_agent import ProjectAgent
except ImportError:
    # Provide mock classes for development if files don't exist
    class ContentAgent:
        def __init__(self, **kwargs):
            pass
    
    class InterviewAgent:
        def __init__(self, **kwargs):
            pass
    
    class ProjectAgent:
        def __init__(self, **kwargs):
            pass

from .shiksha_course_agent import ShikshaCourseAgent

__all__ = ["ContentAgent", "InterviewAgent", "ProjectAgent", "ShikshaCourseAgent"]