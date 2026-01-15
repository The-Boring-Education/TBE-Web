import type { PredefinedChallengeTemplate } from "@tbe/constants";
import { PREDEFINED_CHALLENGES } from "@tbe/constants";
import { challengesService } from "@tbe/services";
import { ArrowLeft, Calendar, Clock, Play, Plus, Sparkles, Star, Target, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Button from "../../common/Buttons/Button";
import { usePrepYatraGamificationContext } from "../contexts/GamificationContext";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
  userId: string;
}

const CreateChallengeModal = ({
  isOpen,
  onClose,
  onChallengeCreated,
  userId
}: CreateChallengeModalProps) => {
  const { showCelebration } = usePrepYatraGamificationContext();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("predefined");
  const [selectedTemplate, setSelectedTemplate] = useState<PredefinedChallengeTemplate | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Custom challenge form data
  const [customForm, setCustomForm] = useState({
    name: "",
    description: "",
    totalDays: "",
    category: ""
  });

  // Customize predefined challenge form
  const [customizeForm, setCustomizeForm] = useState({
    name: "",
    description: "",
    totalDays: "",
    category: ""
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCustomForm({ name: "", description: "", totalDays: "", category: "" });
      setCustomizeForm({ name: "", description: "", totalDays: "", category: "" });
      setSelectedTab("predefined");
      setSelectedTemplate(null);
      setShowCustomizeModal(false);
    }
  }, [isOpen]);

  const handleCustomInputChange = (field: string, value: string) => {
    setCustomForm(prev => {
      const newState = { ...prev, [field]: value };
      return newState;
    });
  };

  const handleCustomizeInputChange = (field: string, value: string) => {
    setCustomizeForm(prev => {
      const newState = { ...prev, [field]: value };
      return newState;
    });
  };

  const handleTemplateSelect = (template: PredefinedChallengeTemplate) => {
    setSelectedTemplate(template);
    setCustomizeForm({
      name: template.name,
      description: template.description,
      totalDays: template.totalDays.toString(),
      category: template.category
    });
    setShowCustomizeModal(true);
  };

  const handlePredefinedChallengeCreate = async () => {
    if (!selectedTemplate) { return; }

    setLoading(true);
    try {
      const result = await challengesService.create({
        name: customizeForm.name,
        description: customizeForm.description,
        totalDays: parseInt(customizeForm.totalDays),
        category: customizeForm.category,
        predefinedType: selectedTemplate.id,
        user: userId
      });

      showCelebration(15);
      toast.success("Challenge created successfully! 🎉");
      onChallengeCreated();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to create challenge: ${error.message}`);
      } else {
        toast.error("Failed to create challenge. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // More specific validation
    const missingFields = [];
    if (!customForm.name?.trim()) { missingFields.push("Challenge Name"); }
    if (!customForm.totalDays?.trim()) { missingFields.push("Duration"); }
    if (!customForm.category?.trim()) { missingFields.push("Category"); }

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    const totalDays = parseInt(customForm.totalDays);
    if (isNaN(totalDays) || totalDays < 1 || totalDays > 365) {
      toast.error("Duration must be a valid number between 1 and 365 days");
      return;
    }

    setLoading(true);
    try {

      const result = await challengesService.create({
        name: customForm.name,
        description: customForm.description || undefined,
        totalDays,
        category: customForm.category,
        user: userId
      });

      showCelebration(15);
      toast.success("Custom challenge created successfully! 🎉");
      onChallengeCreated();
      onClose();
    } catch (error) {
      console.error("Error creating custom challenge:", error);
      if (error instanceof Error) {
        toast.error(`Failed to create challenge: ${error.message}`);
      } else {
        toast.error("Failed to create challenge. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Programming", "Web Development", "Mobile Development", "Data Science", "DevOps", "Career", "Design", "Other"];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Advanced": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto glass border-greyLight">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-contentLight flex items-center gap-2">
              Create Your Challenge
            </DialogTitle>
            <DialogDescription className="text-greyDark">
              Choose from popular challenges or create your own custom learning journey
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full py-4">
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger value="predefined" className="text-[#FF5757] data-[state=active]:text-white data-[state=active]:bg-[#FF5757] border-b-2 border-transparent data-[state=active]:border-[#FF5757] transition-all bg-transparent hover:text-[#FF5757] hover:bg-[#FF5757]/5">
                <Sparkles className="w-4 h-4 mr-2 text-inherit transition-colors" />
                Popular Challenges
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-[#FF5757] data-[state=active]:text-white data-[state=active]:bg-[#FF5757] border-b-2 border-transparent data-[state=active]:border-[#FF5757] transition-all bg-transparent hover:text-[#FF5757] hover:bg-[#FF5757]/5">
                <Plus className="w-4 h-4 mr-2 text-inherit transition-colors" />
                Create Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="predefined" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {PREDEFINED_CHALLENGES.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-greyLight bg-white/50 hover:bg-white/70"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`p-3 rounded-lg bg-gradient-to-br ${template.gradient} bg-opacity-20`}>
                            <span className="text-2xl">{template.icon}</span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg text-contentLight">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 ">
                              <Badge className={`bg-white/80 text-[#FF5757] hover:bg-[#FF5757] hover:text-white border-[#FF5757]/30 hover:border-[#FF5757] text-xs h-5 px-2 py-0.5 rounded-full  flex-shrink-0 whitespace-nowrap transition-all`}>
                                <Calendar className="w-3 h-3 mr-1 inline" />
                                {template.totalDays} days
                              </Badge>
                              <Badge className={`bg-white/80 text-[#FF5757] hover:bg-[#FF5757] hover:text-white border-[#FF5757]/30 hover:border-[#FF5757] text-xs h-5 px-2 py-0.5 flex-shrink-0 whitespace-nowrap transition-all`}>
                                <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                                {template.difficulty}
                              </Badge>
                              <Badge variant="outline" className="bg-white/80 text-[#FF5757] hover:bg-[#FF5757] hover:text-white border-[#FF5757]/30 hover:border-[#FF5757] text-xs h-5 px-2 py-0.5 flex-shrink-0 whitespace-nowrap transition-all">
                                <Clock className="w-3 h-3 mr-1" />
                                ~{template.estimatedHoursPerDay}h/day
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Target className="w-5 h-5 text-gray-400 hover:text-primary transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-greyDark line-clamp-2 mb-3">
                        {template.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-greyLight text-greyDark">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center text-sm text-greyDark mt-4">
                Click on any challenge to customize and start your journey! 🚀
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-6">
              <form onSubmit={handleCustomChallengeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-contentLight">
                    Challenge Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={customForm.name}
                    onChange={(e) => handleCustomInputChange("name", e.target.value)}
                    placeholder="e.g., 30 Days of React Development"
                    className="bg-white border-greyLight text-contentLight focus:border-primary"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-contentLight">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={customForm.description}
                    onChange={(e) => handleCustomInputChange("description", e.target.value)}
                    placeholder="Describe what you want to achieve in this challenge..."
                    className="bg-white border-greyLight text-contentLight border resize-none focus:border-primary"
                    rows={3}
                    maxLength={500}

                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalDays" className="text-contentLight">
                      Duration (Days) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="totalDays"
                      type="number"
                      value={customForm.totalDays}
                      onChange={(e) => handleCustomInputChange("totalDays", e.target.value)}
                      placeholder="e.g., 30"
                      className="bg-white border-greyLight text-contentLight border focus:border-primary"
                      min="1"
                      max="365"
                    />
                    <p className="text-xs text-greyDark">Choose between 1 to 365 days</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-contentLight">
                      Category <span className="text-red-400">*</span>
                    </Label>
                    <select
                      value={customForm.category}
                      onChange={(e) => {
                        handleCustomInputChange("category", e.target.value);
                      }}
                      className="w-full bg-white border border-greyLight text-contentLight rounded px-3 py-2 text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    {customForm.category && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                        Category selected: {customForm.category}
                      </div>
                    )}
                    {!customForm.category && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        Please select a category
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex flex-col-reverse md:flex-row gap-2 mt-6">
                  <Button
                    variant="OUTLINE"
                    onClick={onClose}
                    size="SMALL"
                    text="Cancel"
                    icon={<X className="w-2 h-2 mr-2" />}
                    className="text-sm h-5"
                  />
                  <Button
                    variant="PRIMARY"
                    disabled={loading}
                    size="SMALL"
                    text={loading ? "Creating..." : "Create Challenge"}
                    icon={<Plus className="w-2 h-2 mr-2" />}
                    className="text-sm h-5"
                  />
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog >

      {/* Customize Predefined Challenge Modal */}
      {
        selectedTemplate && (
          <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto glass border-greyLight">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-contentLight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Customize Your Challenge
                </DialogTitle>
                <DialogDescription className="text-greyDark">
                  Personalize "{selectedTemplate.name}" before starting
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customize-name" className="text-contentLight">
                    Challenge Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="customize-name"
                    value={customizeForm.name}
                    onChange={(e) => handleCustomizeInputChange("name", e.target.value)}
                    className="bg-white border-greyLight text-contentLight focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customize-description" className="text-contentLight">
                    Description
                  </Label>
                  <Textarea
                    id="customize-description"
                    value={customizeForm.description}
                    onChange={(e) => handleCustomizeInputChange("description", e.target.value)}
                    className="bg-white border-greyLight text-contentLight focus:border-primary resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customize-days" className="text-contentLight">
                      Duration (Days) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="customize-days"
                      type="number"
                      value={customizeForm.totalDays}
                      onChange={(e) => handleCustomizeInputChange("totalDays", e.target.value)}
                      className="bg-white border-greyLight text-contentLight focus:border-primary"
                      min="1"
                      max="365"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customize-category" className="text-contentLight">
                      Category
                    </Label>
                    <Input
                      id="customize-category"
                      value={customizeForm.category}
                      onChange={(e) => handleCustomizeInputChange("category", e.target.value)}
                      className="bg-white border-greyLight text-contentLight focus:border-primary"
                    />
                  </div>
                </div>

                {/* Learning Path Preview */}
                <div className="space-y-2">
                  <Label className="text-contentLight">Learning Path Preview</Label>
                  <div className="bg-white/50 p-3 rounded-lg border border-greyLight">
                    <div className="text-sm text-greyDark">
                      {selectedTemplate.learningPath.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                          <span className="text-primary">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse md:flex-row gap-2 mt-6">
                <Button
                  variant="OUTLINE"
                  onClick={() => setShowCustomizeModal(false)}
                  size="SMALL"
                  text="Back"
                  icon={<ArrowLeft className="w-2 h-2 mr-2" />}
                  className="text-sm h-5"
                />
                <Button
                  onClick={handlePredefinedChallengeCreate}
                  variant="PRIMARY"
                  disabled={loading}
                  size="SMALL"
                  text={loading ? "Creating..." : "Start Challenge"}
                  icon={<Play className="w-2 h-2 mr-2" />}
                  className="text-sm h-5"
                />
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      }
    </>
  );
};

export default CreateChallengeModal;