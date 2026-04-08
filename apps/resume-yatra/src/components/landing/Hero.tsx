import { Button } from "@tbe/components";
import { ArrowRight, CheckCircle2, FileText, Zap } from "lucide-react";
import { useRouter } from "next/router";

const Hero = () => {
  const router = useRouter();

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Smart Templates",
      description: "Professional resume templates designed for developers",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Step-by-Step Guide",
      description: "Interactive checklist to build your perfect resume",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quick & Easy",
      description: "Build or upgrade your resume in minutes, not hours",
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-white pt-20 pb-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Side - Text Content */}
          <div className="flex-1 max-w-2xl">
            <div className="animate-fade-in">
              <div className="mb-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                  <span className="text-gray-900">Resume Building for</span>
                  <br />
                  <span className="text-primary">Developers</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                A step-by-step checklist app to help you build or upgrade your
                resume like a world-class developer.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mb-12">
                <Button
                  variant="PRIMARY"
                  text="Start Building My Resume"
                  onClick={() => router.push("/builder")}
                  size="MEDIUM"
                  icon={<ArrowRight className="w-2 h-2" />}
                  className="text-sm"
                />
                {/* <Button 
                                    variant="OUTLINE"
                                    text="View Examples"
                                    onClick={() => router.push('/examples')}
                            size="LARGE"
                                    className="text-base px-6 py-3"
                                /> */}
              </div>

              {/* Features Grid */}
              {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                {features.map((feature, index) => (
                                    <div 
                                        key={index}
                                        className='flex flex-col items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors'
                                    >
                                        <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary'>
                                            {feature.icon}
                                        </div>
                                        <h3 className='font-semibold text-gray-900 mb-1'>
                                            {feature.title}
                                        </h3>
                                        <p className='text-sm text-gray-600'>
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div> */}
            </div>
          </div>

          {/* Right Side - Image/Illustration */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-2 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Sachin Kumar Singh
                  </h3>
                  <p className="text-gray-600">Full Stack Developer</p>
                  <p className="text-sm text-gray-500">
                    sachin@example.com | +91 XXXXX XXXXX
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">
                    Professional Summary
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Software Engineer with 5+ years building scalable web
                    applications...
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Experience</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">
                      Senior Software Engineer | TechCorp
                    </p>
                    <p className="text-xs text-gray-500">
                      • Led development of microservices architecture...
                    </p>
                    <p className="text-xs text-gray-500">
                      • Improved system performance by 60%...
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <div className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-purple-700">
                      And much more...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 sm:-top-2  md:top-1 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-bounce">
              ATS Approved ✓
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
              FAANG Ready ✓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
