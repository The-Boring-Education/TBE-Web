"""
Main entry point for The Boring Agents CLI application.
Enhanced with Shiksha course creation capabilities.
"""

import click
import json
import os
import sys
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add src to path for imports
sys.path.append(str(Path(__file__).parent / "src"))

console = Console()

try:
    from src.agents import ShikshaCourseAgent
except ImportError as e:
    console.print(f"[red]Import error: {e}[/red]")
    console.print("[yellow]Running in development mode with limited functionality[/yellow]")
    ShikshaCourseAgent = None


@click.group()
@click.option('--log-level', default='INFO', help='Set logging level')
def cli(log_level):
    """The Boring Agents - AI-powered content generation for education."""
    import logging
    logging.basicConfig(level=getattr(logging, log_level.upper()))
    
    console.print(Panel.fit(
        "[bold blue]The Boring Agents[/bold blue]\n"
        "AI-powered content generation for The Boring Education",
        title="Welcome"
    ))


@cli.group()
def shiksha():
    """Generate complete Shiksha tech courses."""
    pass


@shiksha.command()
@click.option('--name', required=True, help='Course name')
@click.option('--description', required=True, help='Course description')
@click.option('--save', is_flag=True, default=True, help='Save output to file')
@click.option('--output-dir', default='./output/shiksha_courses', help='Output directory')
def create_course(name, description, save, output_dir):
    """Create a complete Shiksha tech course using multi-agent system."""
    
    if not ShikshaCourseAgent:
        console.print("[red]Error: ShikshaCourseAgent not available. Please check your installation.[/red]")
        return
    
    console.print(f"[green]Creating Shiksha course: {name}[/green]")
    console.print(f"[blue]Description: {description}[/blue]")
    
    # Check for API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        console.print("[yellow]Warning: OPENAI_API_KEY not found. Running in mock mode.[/yellow]")
        console.print("Set your API key with: export OPENAI_API_KEY='your-key-here'")
    
    try:
        # Initialize the agent
        agent = ShikshaCourseAgent()
        
        # Create course with progress tracking
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            
            task = progress.add_task("Creating course...", total=None)
            
            # Create the course
            course_data = agent.create_complete_course(name, description)
            
            progress.update(task, description="Course creation completed!")
        
        # Display summary
        display_course_summary(course_data)
        
        if save:
            # Ensure output directory exists
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate filename
            safe_name = name.lower().replace(' ', '_').replace('-', '_')
            filename = f"shiksha_course_{safe_name}.json"
            filepath = os.path.join(output_dir, filename)
            
            # Save the course
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(course_data, f, indent=2, ensure_ascii=False)
            
            console.print(f"[green]✅ Course saved to: {filepath}[/green]")
            
            # Display next steps
            display_next_steps(filepath)
    
    except Exception as e:
        console.print(f"[red]❌ Error creating course: {str(e)}[/red]")
        import traceback
        console.print(f"[red]{traceback.format_exc()}[/red]")


def display_course_summary(course_data):
    """Display a summary of the created course."""
    console.print("\n" + "="*60)
    console.print("[bold green]📚 Course Creation Summary[/bold green]")
    console.print("="*60)
    
    # Course info table
    info_table = Table(title="Course Information")
    info_table.add_column("Property", style="cyan")
    info_table.add_column("Value", style="white")
    
    info_table.add_row("Name", course_data.get('name', 'N/A'))
    info_table.add_row("Slug", course_data.get('slug', 'N/A'))
    info_table.add_row("Difficulty", course_data.get('difficultyLevel', 'N/A'))
    info_table.add_row("Roadmap", course_data.get('roadmap', 'N/A'))
    info_table.add_row("Chapters", str(len(course_data.get('chapters', []))))
    
    console.print(info_table)
    
    # Chapters overview
    chapters = course_data.get('chapters', [])
    if chapters:
        console.print("\n[bold blue]📖 Chapters Overview[/bold blue]")
        for i, chapter in enumerate(chapters, 1):
            console.print(f"  {i}. {chapter.get('name', 'Unnamed Chapter')}")


def display_next_steps(filepath):
    """Display next steps for the user."""
    console.print("\n[bold magenta]🚀 Next Steps[/bold magenta]")
    
    steps = f"""
1. 📝 Review the generated course content in: {filepath}
2. 🎬 Replace video placeholders with actual YouTube links
3. ✏️  Polish and customize the content as needed
4. 🧪 Test the course structure locally
5. 🚀 Publish to your Shiksha platform

💡 Pro tip: The course follows the proven "learning by building" methodology!
"""
    
    console.print(Panel(steps, title="What's Next?", border_style="magenta"))


@shiksha.command()
@click.argument('course_file', type=click.Path(exists=True))
def validate_course(course_file):
    """Validate a Shiksha course JSON file."""
    
    console.print(f"[blue]Validating course file: {course_file}[/blue]")
    
    try:
        with open(course_file, 'r', encoding='utf-8') as f:
            course_data = json.load(f)
        
        # Basic validation
        required_fields = ['name', 'slug', 'description', 'chapters', 'meta']
        missing_fields = [field for field in required_fields if field not in course_data]
        
        if missing_fields:
            console.print(f"[red]❌ Missing required fields: {missing_fields}[/red]")
            return
        
        # Validate chapters
        chapters = course_data.get('chapters', [])
        if not chapters:
            console.print("[red]❌ Course must have at least one chapter[/red]")
            return
        
        for i, chapter in enumerate(chapters):
            if 'name' not in chapter:
                console.print(f"[red]❌ Chapter {i+1} missing name[/red]")
                return
            if 'content' not in chapter:
                console.print(f"[red]❌ Chapter {i+1} missing content[/red]")
                return
        
        console.print("[green]✅ Course file is valid![/green]")
        display_course_summary(course_data)
        
    except json.JSONDecodeError as e:
        console.print(f"[red]❌ Invalid JSON format: {e}[/red]")
    except Exception as e:
        console.print(f"[red]❌ Validation error: {e}[/red]")


@cli.command()
def status():
    """Show configuration and system status."""
    table = Table(title="System Status")
    table.add_column("Component", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Details", style="yellow")
    
    # Check API key
    api_key = os.getenv('OPENAI_API_KEY')
    api_status = "✅ Available" if api_key else "❌ Not Found"
    api_details = "Ready for course generation" if api_key else "Set OPENAI_API_KEY environment variable"
    table.add_row("OpenAI API Key", api_status, api_details)
    
    # Check agent availability
    agent_status = "✅ Available" if ShikshaCourseAgent else "❌ Import Error"
    agent_details = "Multi-agent system ready" if ShikshaCourseAgent else "Check installation and dependencies"
    table.add_row("Shiksha Agent", agent_status, agent_details)
    
    # Check output directory
    output_dir = "./output/shiksha_courses"
    output_exists = os.path.exists(output_dir)
    output_status = "✅ Exists" if output_exists else "📁 Will be created"
    table.add_row("Output Directory", output_status, output_dir)
    
    console.print(table)


@cli.command()
def demo():
    """Run a demo course creation (without API calls)."""
    console.print("[bold blue]🎬 Shiksha Course Creation Demo[/bold blue]")
    
    demo_course = {
        "name": "Introduction to Python Programming",
        "slug": "introduction-to-python-programming",
        "description": "Learn Python from scratch with hands-on projects",
        "difficultyLevel": "Beginner",
        "roadmap": "Programming",
        "chapters": [
            {
                "name": "Getting Started with Python",
                "content": "# Getting Started with Python\n\n### Why Learn Python?\n\nPython is one of the most popular programming languages...",
                "_id": "demo123",
                "createdAt": "2025-01-29T12:00:00.000Z",
                "updatedAt": "2025-01-29T12:00:00.000Z"
            },
            {
                "name": "Project 1: Build Your First Python App",
                "content": "# Project 1: Build Your First Python App\n\nIn this project, you'll create a simple calculator...",
                "_id": "demo124", 
                "createdAt": "2025-01-29T12:00:00.000Z",
                "updatedAt": "2025-01-29T12:00:00.000Z"
            }
        ],
        "meta": "# Introduction to Python Programming\n\nPython is perfect for beginners and professionals alike...",
        "createdAt": "2025-01-29T12:00:00.000Z",
        "updatedAt": "2025-01-29T12:00:00.000Z"
    }
    
    display_course_summary(demo_course)
    
    # Save demo course
    output_dir = "./output/shiksha_courses"
    os.makedirs(output_dir, exist_ok=True)
    demo_file = os.path.join(output_dir, "demo_python_course.json")
    
    with open(demo_file, 'w', encoding='utf-8') as f:
        json.dump(demo_course, f, indent=2, ensure_ascii=False)
    
    console.print(f"\n[green]✅ Demo course saved to: {demo_file}[/green]")


if __name__ == '__main__':
    cli()