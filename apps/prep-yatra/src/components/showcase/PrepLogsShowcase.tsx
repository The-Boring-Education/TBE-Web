import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const PrepLogsShowcase = () => {
    const prepLogs = [
        {
            id: 1,
            title: "System Design - Load Balancers",
            category: "System Design",
            duration: "2 hours",
            date: "Today",
            progress: 85,
            notes: "Studied different load balancing algorithms. Need to practice designing for high availability.",
            tags: ["System Design", "Scalability", "High Availability"]
        },
        {
            id: 2,
            title: "LeetCode - Dynamic Programming",
            category: "Algorithm",
            duration: "1.5 hours",
            date: "Yesterday",
            progress: 70,
            notes: "Solved 3 DP problems. Still struggling with optimization, need more practice.",
            tags: ["Algorithms", "Dynamic Programming", "LeetCode"]
        },
        {
            id: 3,
            title: "Behavioral Questions Practice",
            category: "Behavioral",
            duration: "45 min",
            date: "2 days ago",
            progress: 90,
            notes: "Practiced STAR method responses. Feeling confident about leadership examples.",
            tags: ["Behavioral", "STAR Method", "Leadership"]
        }
    ];

    return (
        <section className='py-20 px-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50'>
            <div className='container mx-auto'>
                <div className='text-center mb-16 animate-fade-in'>
                    <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                        📝 <span className='text-primary'>Prep Logs</span>
                    </h2>
                    <p className='text-xl text-gray max-w-3xl mx-auto'>
                        Track your preparation journey, monitor progress, and
                        never lose sight of your learning goals.
                    </p>
                </div>

                <div className='max-w-4xl mx-auto'>
                    <div className='flex justify-between items-center mb-8 animate-slide-in-left'>
                        <div className='text-white'>
                            <h3 className='text-2xl font-semibold'>
                                📊 Your Preparation Dashboard
                            </h3>
                            <p className='text-gray'>
                                Keep track of your daily prep sessions
                            </p>
                        </div>
                        <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
                            + Add New Log
                        </Button>
                    </div>

                    <div className='space-y-6'>
                        {prepLogs.map((log, index) => (
                            <Card
                                key={log.id}
                                className="glass-dark border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 animate-slide-in-right"
                                style={{animationDelay: `${index * 0.1}s`}}>
                                <CardHeader className='pb-3'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <CardTitle className='text-white text-lg'>
                                                {log.title}
                                            </CardTitle>
                                            <div className='flex gap-2 mt-2'>
                                                <span className='px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium'>
                                                    {log.category}
                                                </span>
                                                <span className='px-3 py-1 bg-gray-600/50 text-gray rounded-full text-sm'>
                                                    ⏱️ {log.duration}
                                                </span>
                                                <span className='px-3 py-1 bg-gray-600/50 text-gray rounded-full text-sm'>
                                                    📅 {log.date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <div className='text-primary font-bold text-lg'>
                                                {log.progress}%
                                            </div>
                                            <div className='w-16 h-2 bg-gray-600 rounded-full overflow-hidden'>
                                                <div
                                                    className='h-full bg-primary transition-all duration-500'
                                                    style={{
                                                        width: `${log.progress}%`
                                                    }} />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-gray mb-4'>
                                        {log.notes}
                                    </p>
                                    <div className='flex flex-wrap gap-2 mb-4'>
                                        {log.tags.map((tag, tagIndex) => (
                                            <span
                                                key={tagIndex}
                                                className='px-2 py-1 bg-primary/10 text-primary border border-primary/30 rounded text-xs'>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='border-primary/30 hover:bg-primary/10 text-white'>
                                            ✏️ Edit
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='border-primary/30 hover:bg-primary/10 text-white'>
                                            🔄 Continue
                                        </Button>
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='border-primary/30 hover:bg-primary/10 text-white'>
                                            📤 Share
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrepLogsShowcase;
