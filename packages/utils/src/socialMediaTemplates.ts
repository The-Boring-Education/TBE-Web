export interface SocialMediaTemplateData {
  challengeName: string;
  currentDay: number;
  totalDays: number;
  progressText: string;
  hoursSpent: number;
  nextGoals: string[];
  predefinedType?: string; // ID of the predefined challenge template
  appUrl: string;
}

export interface SocialMediaTemplate {
  id: string;
  name: string;
  platform: "twitter" | "linkedin" | "facebook" | "general";
  description: string;
  template: (data: SocialMediaTemplateData) => string;
}

// Utility functions
const getChallengeEmoji = () => {
  return "🎯";
};

const getProgressEmoji = (progressPercentage: number) => {
  if (progressPercentage >= 90) {return "🔥";}
  if (progressPercentage >= 75) {return "💪";}
  if (progressPercentage >= 50) {return "🚀";}
  if (progressPercentage >= 25) {return "⚡";}
  return "✨";
};

const getMilestoneMessage = (currentDay: number, totalDays: number) => {
  if (currentDay === totalDays) {
    return "\n🎉 CHALLENGE COMPLETED! What an incredible journey! 🏆";
  }
  if (currentDay === Math.floor(totalDays * 0.5)) {
    return "\n🔥 HALFWAY THERE! The momentum is building! 💪";
  }
  if (currentDay === Math.floor(totalDays * 0.75)) {
    return "\n⚡ 75% COMPLETE! The finish line is in sight! 🏁";
  }
  if (currentDay % 7 === 0) {
    return "\n🌟 One week milestone achieved! Consistency is key! 📈";
  }
  return "";
};

const getRandomHashtags = (count: number = 4) => {
  const motivationalHashtags = [
    "#CodingJourney", "#LearnInPublic", "#PrepYatra", "#TechLearning", 
    "#ConsistencyIsKey", "#NeverStopLearning", "#ChallengeAccepted",
    "#100DaysOfCode", "#DeveloperLife", "#SkillBuilding", "#TechSkills",
    "#CareerGrowth", "#LearningInPublic", "#SoftwareDeveloper", "#Coding"
  ];
  const shuffled = motivationalHashtags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(" ");
};

// Template definitions
export const socialMediaTemplates: SocialMediaTemplate[] = [
  {
    id: "default",
    name: "Default Progress Update",
    platform: "general",
    description: "Standard daily progress update with emojis and milestones",
    template: (data: SocialMediaTemplateData) => {
      const progressPercentage = Math.round((data.currentDay / data.totalDays) * 100);
      const goals = data.nextGoals.filter(g => g.trim()).map((g, i) => `${i + 1}. ${g}`).join("\n") 
        || "1. Continue learning consistently\n2. Apply new concepts in practice";

      return `${getChallengeEmoji()} Day ${data.currentDay + 1}/${data.totalDays} of ${data.challengeName} ${getProgressEmoji(progressPercentage)}

📚 Today's Progress:
${data.progressText}

🎯 Tomorrow's Goals:
${goals}${getMilestoneMessage(data.currentDay, data.totalDays)}

💡 Progress: ${progressPercentage}% complete | ${data.hoursSpent}h invested today

${getRandomHashtags()}

---
Join me on this learning journey! Start your own challenge at ${data.appUrl} 🚀`;
    }
  },
  {
    id: "twitter-short",
    name: "Twitter Optimized",
    platform: "twitter",
    description: "Concise format optimized for Twitter character limit",
    template: (data: SocialMediaTemplateData) => {
      const progressPercentage = Math.round((data.currentDay / data.totalDays) * 100);
      const milestone = getMilestoneMessage(data.currentDay, data.totalDays);
      
      return `${getChallengeEmoji()} Day ${data.currentDay + 1}/${data.totalDays} of ${data.challengeName} ${getProgressEmoji(progressPercentage)}

${data.progressText}

${progressPercentage}% complete • ${data.hoursSpent}h today${milestone}

${getRandomHashtags(3)}

${data.appUrl}`;
    }
  },
  {
    id: "linkedin-professional",
    name: "LinkedIn Professional",
    platform: "linkedin",
    description: "Professional tone suitable for LinkedIn networking",
    template: (data: SocialMediaTemplateData) => {
      const progressPercentage = Math.round((data.currentDay / data.totalDays) * 100);
      const goals = data.nextGoals.filter(g => g.trim()).map((g, i) => `• ${g}`).join("\n") 
        || "• Continue learning consistently\n• Apply new concepts in practice";

      return `🚀 Learning Journey Update: Day ${data.currentDay + 1} of ${data.totalDays}

I'm currently ${progressPercentage}% through my ${data.challengeName} challenge, and today's session was incredibly productive!

📈 Today's Achievements:
${data.progressText}

🎯 Looking ahead to tomorrow:
${goals}

⏱️ Time invested today: ${data.hoursSpent} hours${getMilestoneMessage(data.currentDay, data.totalDays)}

The key to skill development is consistency and deliberate practice. Every day counts toward building expertise.

What learning challenges are you currently pursuing? I'd love to hear about your journey!

${getRandomHashtags(2)}

#ProfessionalDevelopment #SkillBuilding

Learn more and start your own challenge: ${data.appUrl}`;
    }
  },
  {
    id: "motivational",
    name: "Motivational & Inspiring",
    platform: "general",
    description: "High-energy motivational format to inspire others",
    template: (data: SocialMediaTemplateData) => {
      const progressPercentage = Math.round((data.currentDay / data.totalDays) * 100);
      const goals = data.nextGoals.filter(g => g.trim()).map((g, i) => `🔥 ${g}`).join("\n") 
        || "🔥 Continue learning consistently\n🔥 Apply new concepts in practice";

      return `💥 ANOTHER DAY, ANOTHER VICTORY! 💥

Day ${data.currentDay + 1}/${data.totalDays} of my ${data.challengeName} challenge is DONE! ${getProgressEmoji(progressPercentage)}

🏆 What I conquered today:
${data.progressText}

⚡ Tomorrow's mission:
${goals}

📊 Progress: ${progressPercentage}% | Hours invested: ${data.hoursSpent}h${getMilestoneMessage(data.currentDay, data.totalDays)}

💪 Remember: Success isn't about perfection, it's about persistence!

Who else is pushing their limits today? Let's motivate each other! 🚀

${getRandomHashtags(5)}

Start your transformation: ${data.appUrl}`;
    }
  },
  {
    id: "minimalist",
    name: "Clean & Minimalist",
    platform: "general",
    description: "Simple, clean format without excessive emojis",
    template: (data: SocialMediaTemplateData) => {
      const progressPercentage = Math.round((data.currentDay / data.totalDays) * 100);
      const goals = data.nextGoals.filter(g => g.trim()).map((g, i) => `${i + 1}. ${g}`).join("\n") 
        || "1. Continue learning consistently\n2. Apply new concepts in practice";

      return `Day ${data.currentDay + 1} of ${data.totalDays}: ${data.challengeName}

Today's focus:
${data.progressText}

Tomorrow's plan:
${goals}

Progress: ${progressPercentage}% complete
Time invested: ${data.hoursSpent} hours${getMilestoneMessage(data.currentDay, data.totalDays)}

${getRandomHashtags(2)}

${data.appUrl}`;
    }
  },
  {
    id: "storytelling",
    name: "Storytelling Format",
    platform: "general",
    description: "Narrative approach that tells a learning story",
    template: (data: SocialMediaTemplateData) => {
      const progressPercentage = Math.round((data.currentDay / data.totalDays) * 100);
      const dayDescription = data.currentDay <= 3 ? "just starting" : 
                            data.currentDay <= 7 ? "building momentum" :
                            data.currentDay <= 14 ? "finding my rhythm" :
                            progressPercentage >= 75 ? "approaching the finish line" : "making steady progress";

      return `📖 Learning Story: Day ${data.currentDay + 1}

I'm ${dayDescription} on my ${data.challengeName} journey, and today brought new insights and challenges.

The breakthrough moment:
${data.progressText}

What's exciting me about tomorrow:
${data.nextGoals.filter(g => g.trim()).map(g => `✨ ${g}`).join("\n") || "✨ Continue building on today's foundation\n✨ Tackle new challenges with confidence"}

${progressPercentage}% of the way there. ${data.hoursSpent} focused hours today.${getMilestoneMessage(data.currentDay, data.totalDays)}

Every expert was once a beginner. Every pro was once an amateur. Every icon was once an unknown.

The journey continues... 🌟

${getRandomHashtags(3)}

Begin your own story: ${data.appUrl}`;
    }
  }
];

// Template selection helper
export const getTemplateById = (id: string): SocialMediaTemplate | undefined => {
  return socialMediaTemplates.find(template => template.id === id);
};

export const getTemplatesForPlatform = (platform: string): SocialMediaTemplate[] => {
  return socialMediaTemplates.filter(template => 
    template.platform === platform || template.platform === "general"
  );
};

export const generateSocialMessage = (
  templateId: string, 
  data: SocialMediaTemplateData
): string => {
  const template = getTemplateById(templateId);
  if (!template) {
    // Fallback to default template
    return getTemplateById("default")?.template(data) || "";
  }
  return template.template(data);
};

// Export default template for backward compatibility
export const generateDefaultSocialMessage = (data: SocialMediaTemplateData): string => {
  return generateSocialMessage("default", data);
};