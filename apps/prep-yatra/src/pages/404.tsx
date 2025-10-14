import {Button} from "@tbe/components";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@tbe/components";
import {useRouter} from "next/router";

const NotFound = () => {
    const router = useRouter();

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4'>
            {/* Background Elements */}
            <div className='absolute inset-0 overflow-hidden opacity-10'>
                <div className='absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full blur-3xl' />
                <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-primary rounded-full blur-3xl' />
            </div>

            <Card className='glass-dark border-gray-700 w-full max-w-md relative z-10'>
                <CardHeader className='text-center'>
                    <div className='text-center mb-6'>
                        <span className='text-3xl font-bold text-primary'>
                            PrepYatra
                        </span>
                        <p className='text-gray text-sm mt-1'>
                            by The Boring Education
                        </p>
                    </div>

                    <div className='text-8xl font-bold text-primary mb-4'>
                        404
                    </div>
                    <CardTitle className='text-2xl text-white mb-2'>
                        Page Not Found
                    </CardTitle>
                    <CardDescription className='text-gray'>
                        Oops! The page you're looking for doesn't exist. It
                        might have been moved, deleted, or you entered the wrong
                        URL.
                    </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                    <Button
                        onClick={() => router.push("/")}
                        className='w-full bg-primary rounded-md text-primary-foreground hover:bg-primary/90'
                        isLoading={false}
                        active
                        animationType='BOUNCE'
                        variant='PRIMARY'
                        text='Go to Homepage'
                        />
            
                    <Button
                        variant='OUTLINE'
                        text='Go Back'
                        onClick={() => router.back()}
                        className='w-full border-gray-600 rounded-md text-gray hover:bg-gray-700'
                        isLoading={false}
                        active
                        animationType='BOUNCE'
                        />
                       

                    <div className='text-center pt-4'>
                        <p className='text-sm text-gray-400'>
                            Need help? <br />
                            <a
                                href='mailto:support@theboringeducation.com'
                                className='text-primary hover:underline'>
                                Contact Support
                            </a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotFound;
