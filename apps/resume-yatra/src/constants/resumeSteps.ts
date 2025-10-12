import { ResumeStep } from "@/types/resume"

export const RESUME_STEPS: ResumeStep[] = [
    {
        id: "header",
        title: "Professional Header",
        description: "Your professional identity at first glance",
        audience:
            "Essential for everyone - students, professionals, and career changers",
        audienceType: "general",
        importance:
            "This is the first thing recruiters see. A clean, professional header sets the tone for your entire resume.",
        recruitersPoV:
            "Recruiters spend 6 seconds scanning. Your header needs to immediately convey professionalism and make it easy to contact you.",
        proTips: [
            "Use a professional email (firstname.lastname@gmail.com)",
            "Include LinkedIn URL and GitHub for tech roles",
            "Add location (city, state) but skip full address for privacy"
        ],
        checklist: [
            {
                id: "h1",
                text: "Full name in large, readable font",
                checked: false
            },
            { id: "h2", text: "Professional email address", checked: false },
            {
                id: "h3",
                text: "Phone number with proper formatting",
                checked: false
            },
            {
                id: "h4",
                text: "LinkedIn URL (customized if possible)",
                checked: false
            },
            {
                id: "h5",
                text: "Portfolio/GitHub link for relevant roles",
                checked: false
            }
        ],
        examples: {
            good: "John Smith | Software Engineer\njohn.smith@gmail.com | (555) 123-4567 | linkedin.com/in/johnsmith | github.com/johnsmith",
            bad: "John Smith\njohnnyboy123@hotmail.com | 5551234567",
            reasoning:
                "The good example is clean, professional, and provides all necessary contact methods. The bad example uses an unprofessional email and lacks proper formatting."
        }
    },
    {
        id: "summary",
        title: "Professional Summary",
        description: "Your elevator pitch in 2-3 powerful sentences",
        audience: "Critical for professionals with 2+ years experience",
        audienceType: "professionals",
        importance:
            "This is your hook. It determines whether recruiters continue reading your resume.",
        recruitersPoV:
            "We decide in the first 10 seconds if you're worth considering. Your summary should immediately show your value proposition.",
        proTips: [
            "Start with years of experience and key expertise",
            "Include 1-2 quantified achievements",
            "End with what you're seeking or your unique value"
        ],
        checklist: [
            {
                id: "s1",
                text: "Mentions years of experience or key skills",
                checked: false
            },
            {
                id: "s2",
                text: "Includes specific technical skills or domain expertise",
                checked: false
            },
            {
                id: "s3",
                text: "Contains at least one quantified achievement",
                checked: false
            },
            {
                id: "s4",
                text: "Tailored to target role/industry",
                checked: false
            }
        ],
        examples: {
            good: "Software Engineer with 5+ years building scalable web applications, increased user engagement by 40% at previous startup. Expertise in React, Node.js, and cloud architecture.",
            bad: "Experienced software engineer looking for new opportunities. Good with programming languages.",
            reasoning:
                "The good example is specific, quantified, and shows clear value. The bad example is vague and doesn't demonstrate impact."
        }
    },
    {
        id: "experience",
        title: "Work Experience",
        description: "Your professional journey with quantifiable impact",
        audience:
            "Essential for professionals. Students should focus on internships and part-time jobs.",
        audienceType: "professionals",
        importance:
            "This section proves you can deliver results. Each role should tell a story of growth and achievement.",
        recruitersPoV:
            "We look for progression, impact, and relevance to the role you're applying for. Numbers speak louder than words.",
        proTips: [
            "Use action verbs to start each bullet point",
            "Quantify achievements with numbers, percentages, or scale",
            "Focus on results, not just responsibilities"
        ],
        checklist: [
            {
                id: "e1",
                text: "Listed in reverse chronological order",
                checked: false
            },
            {
                id: "e2",
                text: "Each role has 2-4 quantified bullet points",
                checked: false
            },
            {
                id: "e3",
                text: "Uses strong action verbs (Led, Built, Improved, etc.)",
                checked: false
            },
            {
                id: "e4",
                text: "Shows progression and increasing responsibility",
                checked: false
            }
        ],
        examples: {
            good: "Senior Software Engineer | TechCorp (2022-2024)\n• Led development of microservices architecture, reducing API response time by 60%\n• Mentored 3 junior developers, improving team velocity by 25%",
            bad: "Software Engineer | Company (2022-2024)\n• Worked on various projects\n• Helped the team with coding tasks",
            reasoning:
                "The good example shows specific achievements with numbers and demonstrates leadership. The bad example is vague and doesn't show impact."
        }
    },
    {
        id: "projects",
        title: "Projects & Portfolio",
        description: "Showcase your technical skills through real work",
        audience:
            "Critical for students and career changers. Professionals should include significant side projects.",
        audienceType: "students",
        importance:
            "Projects demonstrate your ability to build complete solutions and your passion for technology.",
        recruitersPoV:
            "We want to see what you can actually build. Include live links and GitHub repos so we can verify your skills.",
        proTips: [
            "Include 2-3 of your best projects",
            "Mention the tech stack used",
            "Add live demo links and GitHub repositories"
        ],
        checklist: [
            { id: "p1", text: "2-3 relevant projects listed", checked: false },
            {
                id: "p2",
                text: "Each project has a clear description",
                checked: false
            },
            {
                id: "p3",
                text: "Tech stack/tools mentioned for each project",
                checked: false
            },
            {
                id: "p4",
                text: "Live links or GitHub repositories included",
                checked: false
            }
        ],
        examples: {
            good: "E-commerce Platform | React, Node.js, MongoDB\n• Built full-stack web app with payment integration and user authentication\n• Live: demo.com | GitHub: github.com/user/project",
            bad: "Website Project\n• Made a website using HTML and CSS",
            reasoning:
                "The good example shows technical depth, includes relevant technologies, and provides verifiable links. The bad example lacks detail and credibility."
        }
    },
    {
        id: "skills",
        title: "Technical Skills",
        description: "Your technical toolkit organized clearly",
        audience:
            "Essential for all tech roles. Organize by categories for better readability.",
        audienceType: "tech",
        importance:
            "This section helps recruiters quickly assess your technical fit for the role.",
        recruitersPoV:
            "We scan this section to match your skills with our requirements. Make it easy to find what we're looking for.",
        proTips: [
            "Group skills by categories (Languages, Frameworks, Tools)",
            "List skills in order of proficiency",
            "Only include skills you're comfortable being interviewed on"
        ],
        checklist: [
            {
                id: "sk1",
                text: "Skills organized by categories",
                checked: false
            },
            { id: "sk2", text: "Relevant to target job role", checked: false },
            {
                id: "sk3",
                text: "No outdated or irrelevant technologies",
                checked: false
            },
            {
                id: "sk4",
                text: "Honest representation of skill level",
                checked: false
            }
        ],
        examples: {
            good: "Languages: JavaScript, Python, Java\nFrameworks: React, Node.js, Express\nDatabases: MongoDB, PostgreSQL\nTools: Git, Docker, AWS",
            bad: "JavaScript, HTML, CSS, React, MongoDB, Photoshop, Microsoft Word, Excel",
            reasoning:
                "The good example is well-organized and focuses on relevant technical skills. The bad example mixes technical and basic software skills without structure."
        }
    },
    {
        id: "achievements",
        title: "Achievements & Awards",
        description: "Highlight your exceptional accomplishments",
        audience: "Optional but powerful for showcasing standout achievements",
        audienceType: "general",
        importance:
            "This section sets you apart from other candidates by highlighting your unique accomplishments.",
        recruitersPoV:
            "Achievements show us you're a high performer who goes above and beyond expectations.",
        proTips: [
            "Include competition wins, scholarships, or recognition",
            "Quantify the achievement (e.g., 'Top 1% of 10,000 participants')",
            "Focus on recent and relevant achievements"
        ],
        checklist: [
            {
                id: "a1",
                text: "2-4 significant achievements listed",
                checked: false
            },
            {
                id: "a2",
                text: "Each achievement is quantified or has context",
                checked: false
            },
            {
                id: "a3",
                text: "Achievements are relevant to your field",
                checked: false
            },
            {
                id: "a4",
                text: "Listed in reverse chronological order",
                checked: false
            }
        ],
        examples: {
            good: "• Winner, Google Code Jam 2023 (Top 100 out of 25,000 participants)\n• Dean's List, Computer Science Department (3 consecutive semesters)\n• Best Innovation Award, University Hackathon 2022",
            bad: "• Won a coding competition\n• Good grades in college\n• Participated in hackathon",
            reasoning:
                "The good example provides specific context, numbers, and credible sources. The bad example is vague and doesn't demonstrate the significance of achievements."
        }
    },
    {
        id: "opensource",
        title: "Open Source Contributions",
        description: "Showcase your community involvement and coding skills",
        audience: "Highly valuable for tech roles, especially for developers",
        audienceType: "tech",
        importance:
            "Open source contributions demonstrate your coding skills, collaboration ability, and passion for technology.",
        recruitersPoV:
            "We love seeing developers who contribute to the community. It shows initiative and real-world coding experience.",
        proTips: [
            "Include your most significant contributions",
            "Mention the impact of your contributions (stars, downloads, users)",
            "Link to your GitHub profile and specific repositories"
        ],
        checklist: [
            {
                id: "os1",
                text: "2-3 significant open source contributions",
                checked: false
            },
            {
                id: "os2",
                text: "Impact metrics included (stars, downloads, PRs merged)",
                checked: false
            },
            {
                id: "os3",
                text: "GitHub profile and repository links included",
                checked: false
            },
            {
                id: "os4",
                text: "Brief description of your contribution",
                checked: false
            }
        ],
        examples: {
            good: "• React Component Library | 500+ stars, 2000+ weekly downloads\n  - Created reusable UI components, reducing development time by 40%\n• Contributor to TensorFlow.js | 15+ merged PRs\n  - Fixed critical bugs and improved documentation",
            bad: "• Contributed to some GitHub projects\n• Fixed a few bugs in open source",
            reasoning:
                "The good example shows specific impact, metrics, and clear value. The bad example is too vague and doesn't demonstrate the significance of contributions."
        }
    }
]
