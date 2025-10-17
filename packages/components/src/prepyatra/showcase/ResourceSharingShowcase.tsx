import {Card, CardContent, CardHeader, CardTitle} from "../ui/card";
import Button from "../../common/Buttons/Button";

const ResourceSharingShowcase = () => {
    const resources = [
        {
            id: 1,
            title: "Complete System Design Interview Guide",
            author: "Alex Kumar",
            avatar: "🧑‍💻",
            description:
                "Comprehensive guide covering all major system design concepts with real-world examples and practice problems.",
            tags: ["System Design", "Interview Prep", "Guide"],
            upvotes: 234,
            comments: 45,
            timeAgo: "2 hours ago",
            type: "PDF Guide"
        },
        {
            id: 2,
            title: "LeetCode Pattern Recognition Cheat Sheet",
            author: "Sarah Chen",
            avatar: "👩‍💻",
            description:
                "Visual cheat sheet for identifying common algorithm patterns in coding interviews. Includes 50+ problem examples.",
            tags: ["Algorithms", "LeetCode", "Cheat Sheet"],
            upvotes: 189,
            comments: 32,
            timeAgo: "5 hours ago",
            type: "Visual Guide"
        },
        {
            id: 3,
            title: "Behavioral Interview STAR Method Template",
            author: "Mike Rodriguez",
            avatar: "👨‍💼",
            description:
                "Ready-to-use template for structuring behavioral interview responses using the STAR method.",
            tags: ["Behavioral", "Template", "STAR Method"],
            upvotes: 156,
            comments: 28,
            timeAgo: "1 day ago",
            type: "Template"
        },
        {
            id: 4,
            title: "Google SWE Interview Experience (L4)",
            author: "Priya Patel",
            avatar: "👩‍🔬",
            description:
                "Detailed breakdown of my Google Software Engineer interview process, including questions asked and preparation strategy.",
            tags: ["Google", "Interview Experience", "SWE"],
            upvotes: 312,
            comments: 67,
            timeAgo: "2 days ago",
            type: "Experience"
        }
    ];

    return (
        <section className='py-20 px-4 bg-white'>
            <div className='container mx-auto'>
                <div className='text-center mb-16 animate-fade-in'>
                    <h2 className='text-4xl md:text-5xl font-bold text-contentLight mb-6'>
                        🔄{" "}
                        <span className='text-primary'>
                            Resource Sharing Feed
                        </span>
                    </h2>
                    <p className='text-xl text-greyDark max-w-3xl mx-auto'>
                        Discover and share valuable resources with the
                        community. Learn from others' experiences and contribute
                        your own insights.
                    </p>
                </div>

                <div className='max-w-4xl mx-auto'>
                    <div className='flex justify-between items-center mb-8 animate-slide-in-left'>
                        <div className='text-contentLight'>
                            <h3 className='text-2xl font-semibold'>
                                🔥 Trending Resources
                            </h3>
                            <p className='text-greyDark'>
                                Community-curated content to boost your prep
                            </p>
                        </div>
                        <Button 
                            variant='PRIMARY'
                            text='+ Share Resource'
                            className='bg-primary text-white hover:bg-primary/90 text-sm px-4 py-2'
                        />
                    </div>

                    <div className='space-y-6'>
                        {resources.map((resource, index) => (
                            <Card
                                key={resource.id}
                                className="glass border-greyLight hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] animate-slide-in-right"
                                style={{animationDelay: `${index * 0.1}s`}}>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start gap-4'>
                                        <div className='text-2xl'>
                                            {resource.avatar}
                                        </div>
                                        <div className='flex-1'>
                                            <div className='flex items-center gap-2 mb-2'>
                                                <span className='text-contentLight font-semibold'>
                                                    {resource.author}
                                                </span>
                                                <span className='text-greyDark text-sm'>
                                                    •
                                                </span>
                                                <span className='text-greyDark text-sm'>
                                                    {resource.timeAgo}
                                                </span>
                                                <span className='px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium'>
                                                    {resource.type}
                                                </span>
                                            </div>
                                            <CardTitle className='text-contentLight text-xl mb-2'>
                                                {resource.title}
                                            </CardTitle>
                                            <p className='text-greyDark text-sm'>
                                                {resource.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex flex-wrap gap-2 mb-4'>
                                        {resource.tags.map((tag, tagIndex) => (
                                            <span
                                                key={tagIndex}
                                                className='px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full text-sm'>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-6'>
                                            <button className='flex items-center gap-2 text-greyDark hover:text-primary transition-colors'>
                                                <svg
                                                    className='w-5 h-5'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M5 15l7-7 7 7'
                                                    />
                                                </svg>
                                                <span className='font-medium'>
                                                    {resource.upvotes}
                                                </span>
                                            </button>

                                            <button className='flex items-center gap-2 text-greyDark hover:text-primary transition-colors'>
                                                <svg
                                                    className='w-5 h-5'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                                                    />
                                                </svg>
                                                <span>{resource.comments}</span>
                                            </button>

                                            <button className='flex items-center gap-2 text-greyDark hover:text-primary transition-colors'>
                                                <svg
                                                    className='w-5 h-5'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'>
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                                                    />
                                                </svg>
                                                Share
                                            </button>
                                        </div>

                                        <Button
                                            variant='NEUTRAL'
                                            text='📖 View Resource'
                                            className='text-sm px-3 py-1.5'
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className='text-center mt-8'>
                        <Button
                            variant='NEUTRAL'
                            text='Load More Resources 🔽'
                            className='text-sm px-4 py-2'
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResourceSharingShowcase;
