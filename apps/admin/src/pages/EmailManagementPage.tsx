import {
  Code,
  Edit,
  Eye,
  Mail,
  Plus,
  Save,
  Send,
  TestTube,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";

import {
  useSendDevRelOfferLetter,
  useSendEmail,
  useSendOfferLetter,
  useSendTestEmail,
} from "@/api/emailApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { defaultEmailTemplates, getTemplateById } from "@/data/emailTemplates";
import { useToast } from "@/hooks/use-toast";
import type { DevRelOfferData, EmailTemplate, OfferLetterData } from "@/types";

const EmailManagementPage = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [testEmail, setTestEmail] = useState("sachinkshuklaoo7@gmail.com");

  // Form states for offer letters
  const [offerData, setOfferData] = useState<OfferLetterData>({
    candidateName: "",
    candidateEmail: "",
    position: "",
    department: "",
    startDate: "",
    duration: "",
    salary: "",
    location: "",
    reportingTo: "",
    companyName: "The Boring Education",
    additionalTerms: "",
    responsibilities: [
      "Collaborate with cross-functional teams to deliver high-quality projects",
      "Contribute to technical decisions and architectural discussions",
      "Maintain code quality and follow best practices",
      "Participate in code reviews and knowledge sharing",
    ],
    benefits: [
      "Performance based compensation",
      "Flexible work hours and remote work options",
      "Building a strong developer community",
      "Opportunities to speak at developer events and workshops",
      "Access to the latest tech equipment and tools",
    ],
  });

  const [devRelData, setDevRelData] = useState<DevRelOfferData>({
    candidateName: "",
    candidateEmail: "",
    position: "",
    startDate: "",
    duration: "",
    salary: "",
    location: "",
    reportingTo: "",
    responsibilities: [
      "Build and maintain relationships with the developer community",
      "Create technical content, tutorials, and documentation",
      "Organize and speak at developer events and workshops",
      "Gather and relay developer feedback to the product team",
      "Contribute to open-source projects and tools",
    ],
    benefits: [
      "Performance based compensation",
      "Flexible work hours and remote work options",
      "Building a strong developer community",
      "Opportunities to speak at developer events and workshops",
      "Access to the latest tech equipment and tools",
    ],
  });

  // API hooks
  const sendEmailMutation = useSendEmail();
  const sendTestEmailMutation = useSendTestEmail();
  const sendOfferLetterMutation = useSendOfferLetter();
  const sendDevRelOfferLetterMutation = useSendDevRelOfferLetter();

  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null,
  );

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (template) {
      setSelectedTemplate(template);
      setEditingTemplate({ ...template });
      setIsEditing(false);
      setPreviewMode(false);
    }
  };

  const handleEditTemplate = () => {
    if (selectedTemplate) {
      setEditingTemplate({ ...selectedTemplate });
      setIsEditing(true);
    }
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setSelectedTemplate(editingTemplate);
      setIsEditing(false);
      toast({
        title: "Template Updated",
        description: "Email template has been updated successfully.",
      });
    }
  };

  const handleCancelEdit = () => {
    if (selectedTemplate) {
      setEditingTemplate({ ...selectedTemplate });
      setIsEditing(false);
    }
  };

  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  const handleSendTestEmail = async () => {
    if (!selectedTemplate) return;

    const testEmailData = {
      from_email: "theboringeducation@gmail.com",
      from_name: "Sachin from The Boring Education",
      to_email: testEmail,
      to_name: "Test User",
      subject: selectedTemplate.subject,
      html_content: selectedTemplate.htmlContent,
    };

    try {
      await sendTestEmailMutation.mutateAsync(testEmailData);
      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const handleSendOfferLetter = async () => {
    if (!selectedTemplate || !offerData.candidateEmail) return;

    try {
      await sendOfferLetterMutation.mutateAsync({
        template: selectedTemplate,
        offerData,
      });
      toast({
        title: "Offer Letter Sent",
        description: `Offer letter sent to ${offerData.candidateName}`,
      });
      // Reset form
      setOfferData({
        candidateName: "",
        candidateEmail: "",
        position: "",
        department: "",
        startDate: "",
        duration: "",
        salary: "",
        location: "",
        reportingTo: "",
        companyName: "The Boring Education",
        additionalTerms: "",
        responsibilities: [
          "Build and maintain relationships with the developer community",
          "Create technical content, tutorials, and documentation",
          "Organize and speak at developer events and workshops",
          "Gather and relay developer feedback to the product team",
          "Contribute to open-source projects and tools",
        ],
        benefits: [
          "Performance based compensation",
          "Flexible work hours and remote work options",
          "Building a strong developer community",
          "Opportunities to speak at developer events and workshops",
          "Access to the latest tech equipment and tools",
        ],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send offer letter",
        variant: "destructive",
      });
    }
  };

  const handleSendDevRelOfferLetter = async () => {
    console.log("selectedTemplate", selectedTemplate);
    if (!selectedTemplate || !devRelData.candidateEmail) return;

    try {
      await sendDevRelOfferLetterMutation.mutateAsync({
        template: selectedTemplate,
        offerData: devRelData,
      });
      toast({
        title: "DevRel Offer Letter Sent",
        description: `DevRel offer letter sent to ${devRelData.candidateName}`,
      });
      // Reset form
      setDevRelData({
        candidateName: "",
        candidateEmail: "",
        position: "",
        startDate: "",
        duration: "",
        salary: "",
        location: "",
        reportingTo: "",
        responsibilities: [
          "Build and maintain relationships with the developer community",
          "Create technical content, tutorials, and documentation",
          "Organize and speak at developer events and workshops",
          "Gather and relay developer feedback to the product team",
          "Contribute to open-source projects and tools",
        ],
        benefits: [
          "Performance based compensation",
          "Flexible work hours and remote work options",
          "Building a strong developer community",
          "Opportunities to speak at developer events and workshops",
          "Access to the latest tech equipment and tools",
        ],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send DevRel offer letter",
        variant: "destructive",
      });
    }
  };

  // Responsibilities and Benefits management for Team offers
  const addOfferResponsibility = () => {
    setOfferData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""],
    }));
  };

  const updateOfferResponsibility = (index: number, value: string) => {
    setOfferData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const removeOfferResponsibility = (index: number) => {
    setOfferData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const addOfferBenefit = () => {
    setOfferData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }));
  };

  const updateOfferBenefit = (index: number, value: string) => {
    setOfferData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeOfferBenefit = (index: number) => {
    setOfferData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  // Responsibilities and Benefits management for DevRel offers
  const addResponsibility = () => {
    setDevRelData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""],
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setDevRelData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.map((item, i) =>
        i === index ? value : item,
      ),
    }));
  };

  const removeResponsibility = (index: number) => {
    setDevRelData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const addBenefit = () => {
    setDevRelData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setDevRelData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeBenefit = (index: number) => {
    setDevRelData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const renderPreview = () => {
    if (!selectedTemplate) return null;

    let previewContent = selectedTemplate.htmlContent;
    let previewSubject = selectedTemplate.subject;

    // Replace variables with sample data for preview
    const sampleData = {
      "{{candidateName}}": "John Doe",
      "{{candidateEmail}}": "john.doe@example.com",
      "{{position}}": "Software Engineer",
      "{{department}}": "Engineering",
      "{{startDate}}": "January 15, 2024",
      "{{duration}}":
        "<li><strong>Duration:</strong> Full-time, Permanent</li>",
      "{{salary}}": "<li><strong>Salary:</strong> $80,000 - $100,000</li>",
      "{{location}}": "Remote",
      "{{reportingTo}}":
        "<li><strong>Reporting To:</strong> Engineering Manager</li>",
      "{{companyName}}": "The Boring Education",
      "{{additionalTerms}}":
        "<p>Additional terms and conditions will be provided in the formal offer letter.</p>",
      "{{responsibilities}}":
        "<li>Build and maintain developer relationships</li><li>Create technical content and tutorials</li><li>Organize developer events and workshops</li>",
      "{{benefits}}":
        "<li>Competitive salary and equity</li><li>Flexible work hours</li><li>Professional development budget</li>",
    };

    Object.entries(sampleData).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(key, "g"), value);
      previewSubject = previewSubject.replace(new RegExp(key, "g"), value);
    });

    return (
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-2">
          Preview: {previewSubject}
        </h3>
        <div
          className="border rounded p-4 max-h-96 overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600 mt-2">
            Send offer letters and manage email templates
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail size={14} />
            Email System
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Edit size={16} />
            Templates
          </TabsTrigger>
          <TabsTrigger value="team-offer" className="flex items-center gap-2">
            <Users size={16} />
            Team Offers
          </TabsTrigger>
          <TabsTrigger value="devrel-offer" className="flex items-center gap-2">
            <Code size={16} />
            DevRel Offers
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={20} />
                  Email Templates
                </CardTitle>
                <CardDescription>
                  Select and edit email templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {defaultEmailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          {template.category}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {template.variables.length} vars
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Editor/Preview */}
            <div className="lg:col-span-2 space-y-4">
              {selectedTemplate ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedTemplate.name}</CardTitle>
                          <CardDescription>
                            Template ID: {selectedTemplate.id}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviewToggle}
                          >
                            <Eye size={16} className="mr-2" />
                            {previewMode ? "Hide" : "Show"} Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditTemplate}
                            disabled={isEditing}
                          >
                            <Edit size={16} className="mr-2" />
                            Edit
                          </Button>
                          {isEditing && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveTemplate}
                              >
                                <Save size={16} className="mr-2" />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <X size={16} className="mr-2" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              value={editingTemplate?.subject || ""}
                              onChange={(e) =>
                                setEditingTemplate((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        subject: e.target.value,
                                      }
                                    : null,
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="htmlContent">HTML Content</Label>
                            <Textarea
                              id="htmlContent"
                              value={editingTemplate?.htmlContent || ""}
                              onChange={(e) =>
                                setEditingTemplate((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        htmlContent: e.target.value,
                                      }
                                    : null,
                                )
                              }
                              rows={20}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      ) : previewMode ? (
                        renderPreview()
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label>Subject</Label>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {selectedTemplate.subject}
                            </p>
                          </div>
                          <div>
                            <Label>Variables</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedTemplate.variables.map((variable) => (
                                <Badge key={variable} variant="secondary">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Test Email Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TestTube size={20} />
                        Test Email
                      </CardTitle>
                      <CardDescription>
                        Send a test email to verify the template
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Test email address"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                        <Button
                          onClick={handleSendTestEmail}
                          disabled={sendTestEmailMutation.isPending}
                        >
                          <Send size={16} className="mr-2" />
                          {sendTestEmailMutation.isPending
                            ? "Sending..."
                            : "Send Test"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <Mail size={48} className="mx-auto mb-4" />
                      <p>Select a template to view and edit</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Team Offer Letters Tab */}
        <TabsContent value="team-offer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Team Offer Letter
              </CardTitle>
              <CardDescription>
                Send offer letters to team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidateName">Candidate Name *</Label>
                  <Input
                    id="candidateName"
                    value={offerData.candidateName}
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        candidateName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="candidateEmail">Candidate Email *</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={offerData.candidateEmail}
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        candidateEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={offerData.position}
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={offerData.department}
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    value={offerData.startDate}
                    placeholder="e.g., January 15, 2024 or Immediately"
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={offerData.duration}
                    placeholder="e.g., Full-time, Permanent or Contract - 6 months"
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    value={offerData.salary}
                    placeholder="e.g., $80,000 - $100,000 annually"
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        salary: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={offerData.location}
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reportingTo">Reporting To</Label>
                  <Input
                    id="reportingTo"
                    value={offerData.reportingTo}
                    placeholder="e.g., Engineering Manager"
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        reportingTo: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={offerData.companyName}
                    onChange={(e) =>
                      setOfferData((prev) => ({
                        ...prev,
                        companyName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="additionalTerms">Additional Terms</Label>
                <Textarea
                  id="additionalTerms"
                  value={offerData.additionalTerms}
                  onChange={(e) =>
                    setOfferData((prev) => ({
                      ...prev,
                      additionalTerms: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Enter any additional terms or conditions..."
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Key Responsibilities</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOfferResponsibility}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Responsibility
                  </Button>
                </div>
                {offerData.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={responsibility}
                      onChange={(e) =>
                        updateOfferResponsibility(index, e.target.value)
                      }
                      placeholder="Enter responsibility..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOfferResponsibility(index)}
                      disabled={offerData.responsibilities.length === 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Benefits & Perks</Label>
                  <Button variant="outline" size="sm" onClick={addOfferBenefit}>
                    <Plus size={16} className="mr-2" />
                    Add Benefit
                  </Button>
                </div>
                {offerData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={benefit}
                      onChange={(e) =>
                        updateOfferBenefit(index, e.target.value)
                      }
                      placeholder="Enter benefit..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOfferBenefit(index)}
                      disabled={offerData.benefits.length === 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSendOfferLetter}
                  disabled={
                    sendOfferLetterMutation.isPending ||
                    !offerData.candidateEmail
                  }
                  className="flex items-center gap-2"
                >
                  <Send size={16} />
                  {sendOfferLetterMutation.isPending
                    ? "Sending..."
                    : "Send Offer Letter"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setOfferData({
                      candidateName: "",
                      candidateEmail: "",
                      position: "",
                      department: "",
                      startDate: "",
                      duration: "",
                      salary: "",
                      location: "",
                      reportingTo: "",
                      companyName: "The Boring Education",
                      additionalTerms: "",
                      responsibilities: [
                        "Collaborate with cross-functional teams to deliver high-quality projects",
                        "Contribute to technical decisions and architectural discussions",
                        "Maintain code quality and follow best practices",
                        "Participate in code reviews and knowledge sharing",
                      ],
                      benefits: [
                        "Performance based compensation",
                        "Flexible work hours and remote work options",
                        "Building a strong developer community",
                        "Opportunities to speak at developer events and workshops",
                        "Access to the latest tech equipment and tools",
                      ],
                    })
                  }
                >
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DevRel Offer Letters Tab */}
        <TabsContent value="devrel-offer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} />
                DevRel Team Offer Letter
              </CardTitle>
              <CardDescription>
                Send offer letters to DevRel team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="devrelName">Candidate Name *</Label>
                  <Input
                    id="devrelName"
                    value={devRelData.candidateName}
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        candidateName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelEmail">Candidate Email *</Label>
                  <Input
                    id="devrelEmail"
                    type="email"
                    value={devRelData.candidateEmail}
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        candidateEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelPosition">Position *</Label>
                  <Input
                    id="devrelPosition"
                    value={devRelData.position}
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelStartDate">Start Date *</Label>
                  <Input
                    id="devrelStartDate"
                    value={devRelData.startDate}
                    placeholder="e.g., January 15, 2024 or Immediately"
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelDuration">Duration</Label>
                  <Input
                    id="devrelDuration"
                    value={devRelData.duration}
                    placeholder="e.g., Full-time, Permanent or Contract - 6 months"
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelSalary">Salary</Label>
                  <Input
                    id="devrelSalary"
                    value={devRelData.salary}
                    placeholder="e.g., $90,000 - $120,000 annually"
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        salary: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelLocation">Location *</Label>
                  <Input
                    id="devrelLocation"
                    value={devRelData.location}
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="devrelReportingTo">Reporting To</Label>
                  <Input
                    id="devrelReportingTo"
                    value={devRelData.reportingTo}
                    placeholder="e.g., Head of Developer Relations"
                    onChange={(e) =>
                      setDevRelData((prev) => ({
                        ...prev,
                        reportingTo: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Responsibilities</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addResponsibility}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Responsibility
                  </Button>
                </div>
                {devRelData.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={responsibility}
                      onChange={(e) =>
                        updateResponsibility(index, e.target.value)
                      }
                      placeholder="Enter responsibility..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeResponsibility(index)}
                      disabled={devRelData.responsibilities.length === 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Benefits & Perks</Label>
                  <Button variant="outline" size="sm" onClick={addBenefit}>
                    <Plus size={16} className="mr-2" />
                    Add Benefit
                  </Button>
                </div>
                {devRelData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Enter benefit..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                      disabled={devRelData.benefits.length === 1}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSendDevRelOfferLetter}
                  disabled={
                    sendDevRelOfferLetterMutation.isPending ||
                    !devRelData.candidateEmail
                  }
                  className="flex items-center gap-2"
                >
                  <Send size={16} />
                  {sendDevRelOfferLetterMutation.isPending
                    ? "Sending..."
                    : "Send DevRel Offer Letter"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setDevRelData({
                      candidateName: "",
                      candidateEmail: "",
                      position: "",
                      startDate: "",
                      duration: "",
                      salary: "",
                      location: "",
                      reportingTo: "",
                      responsibilities: [
                        "Build and maintain relationships with the developer community",
                        "Create technical content, tutorials, and documentation",
                        "Organize and speak at developer events and workshops",
                        "Gather and relay developer feedback to the product team",
                        "Contribute to open-source projects and tools",
                      ],
                      benefits: [
                        "Competitive salary and equity package",
                        "Flexible work hours and remote work options",
                        "Conference and training budget",
                        "Latest tech equipment and tools",
                        "Travel opportunities for speaking engagements",
                      ],
                    })
                  }
                >
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Variable Injection Documentation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code size={20} />
            Email Template Variable Injection Guide
          </CardTitle>
          <CardDescription>
            Learn how to add and use dynamic variables in your email templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-800">
              How to Add Variables to Email Templates:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  1.
                </span>
                <span>
                  Use double curly braces to create variables:{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    {"{{variableName}}"}
                  </code>
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  2.
                </span>
                <span>
                  Add the variable to the template's variables array in{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    emailTemplates.ts
                  </code>
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  3.
                </span>
                <span>
                  Update the form interfaces in{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    types/index.ts
                  </code>{" "}
                  if needed
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold mb-3 text-amber-800">
              Available Template Variables:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-amber-700 mb-2">
                  Basic Information:
                </h5>
                <ul className="space-y-1 text-amber-600">
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{candidateName}}"}
                    </code>{" "}
                    - Candidate's full name
                  </li>
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{candidateEmail}}"}
                    </code>{" "}
                    - Candidate's email
                  </li>
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{position}}"}
                    </code>{" "}
                    - Job position title
                  </li>
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{companyName}}"}
                    </code>{" "}
                    - Company name
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-amber-700 mb-2">
                  Position Details:
                </h5>
                <ul className="space-y-1 text-amber-600">
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{department}}"}
                    </code>{" "}
                    - Department name
                  </li>
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{startDate}}"}
                    </code>{" "}
                    - Start date (text format)
                  </li>
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{duration}}"}
                    </code>{" "}
                    - Employment duration
                  </li>
                  <li>
                    <code className="bg-amber-100 px-1 rounded">
                      {"{{location}}"}
                    </code>{" "}
                    - Work location
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold mb-3 text-green-800">
              Optional Variables (shown only when provided):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <ul className="space-y-1 text-green-600">
                  <li>
                    <code className="bg-green-100 px-1 rounded">
                      {"{{salary}}"}
                    </code>{" "}
                    - Salary information
                  </li>
                  <li>
                    <code className="bg-green-100 px-1 rounded">
                      {"{{reportingTo}}"}
                    </code>{" "}
                    - Reporting manager
                  </li>
                </ul>
              </div>
              <div>
                <ul className="space-y-1 text-green-600">
                  <li>
                    <code className="bg-green-100 px-1 rounded">
                      {"{{responsibilities}}"}
                    </code>{" "}
                    - List of key responsibilities
                  </li>
                  <li>
                    <code className="bg-green-100 px-1 rounded">
                      {"{{benefits}}"}
                    </code>{" "}
                    - Benefits and perks list
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold mb-3 text-purple-800">
              Adding New Responsibilities or Benefits:
            </h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start">
                <span className="font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  1.
                </span>
                <span>
                  Use the "Add Responsibility" or "Add Benefit" buttons in the
                  form
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  2.
                </span>
                <span>
                  Each item will be automatically formatted as a list item in
                  the email
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  3.
                </span>
                <span>
                  Pre-defined templates are provided but can be edited for each
                  role
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-3 mt-0.5">
                  4.
                </span>
                <span>
                  Remove items using the X button, but at least one item must
                  remain
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-3 text-blue-800">
              Template Customization Tips:
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>
                • Use the "Edit" button to modify email templates directly
              </li>
              <li>
                • Preview templates with sample data using the "Show Preview"
                button
              </li>
              <li>
                • Test emails before sending to candidates using the test email
                feature
              </li>
              <li>
                • Optional fields (salary, reporting) are only included in
                emails when values are provided
              </li>
              <li>
                • HTML formatting is supported for rich text content in
                templates
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailManagementPage;
