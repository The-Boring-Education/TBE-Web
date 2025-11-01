import {Flame, Calendar, Target, Award} from "lucide-react";

const ProfileShowcase = () => {
    return (
        <section className='py-16 px-4 bg-gradient-to-b from-gray-50 to-white'>
            <div className='container mx-auto max-w-6xl'>
                <div className='text-center mb-12'>
                    <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                        Track Your{" "}
                        <span className='text-primary'>Progress</span>
                    </h2>
                    <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                        Stay motivated with streak counters, progress tracking,
                        and achievement badges
                    </p>
                </div>

                <div className='max-w-lg mx-auto'>
                    <div className='bg-white rounded-3xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300'>
                        {/* Profile Header */}
                        <div className='flex items-center mb-6 pb-5 border-b border-gray-100'>
                            <div className='w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md'>
                                AK
                            </div>
                            <div className='ml-4'>
                                <h3 className='text-lg font-bold text-gray-900'>
                                    Alex Kumar
                                </h3>
                                <p className='text-sm text-gray-500'>
                                    Full Stack Developer
                                </p>
                            </div>
                        </div>

                        {/* Streak Counter */}
                        <div className='bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 mb-5 border border-orange-100'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Flame className='w-5 h-5 text-orange-500' />
                                    <span className='text-gray-700 font-semibold text-sm'>
                                        Current Streak
                                    </span>
                                </div>
                                <span className='text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                                    15 days
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className='grid grid-cols-2 gap-3 mb-5'>
                            <div className='bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 hover:border-primary transition-colors'>
                                <Calendar className='w-5 h-5 text-primary mx-auto mb-2' />
                                <div className='text-2xl font-bold text-gray-900'>
                                    142
                                </div>
                                <div className='text-gray-500 text-xs font-medium'>
                                    Hours Logged
                                </div>
                            </div>
                            <div className='bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 hover:border-primary transition-colors'>
                                <Target className='w-5 h-5 text-primary mx-auto mb-2' />
                                <div className='text-2xl font-bold text-gray-900'>
                                    8
                                </div>
                                <div className='text-gray-500 text-xs font-medium'>
                                    Interviews
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className='bg-gray-50 rounded-2xl p-4 border border-gray-100'>
                            <div className='flex items-center gap-2 mb-3'>
                                <Award className='w-4 h-4 text-primary' />
                                <span className='text-gray-900 font-semibold text-sm'>
                                    Recent Activity
                                </span>
                            </div>
                            <div className='space-y-2'>
                                <div className='text-sm text-gray-600 flex items-start'>
                                    <span className='text-primary mr-2'>•</span>
                                    Completed DSA practice - 3 hours
                                </div>
                                <div className='text-sm text-gray-600 flex items-start'>
                                    <span className='text-primary mr-2'>•</span>
                                    Added contact: Google Recruiter
                                </div>
                                <div className='text-sm text-gray-600 flex items-start'>
                                    <span className='text-primary mr-2'>•</span>
                                    Shared system design resource
                                </div>
                            </div>
                        </div>

                        {/* Achievement Badge */}
                        <div className='mt-5 text-center'>
                            <div className='inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow'>
                                <span className='text-lg'>🏆</span>
                                Consistency Champion
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfileShowcase;
