import { Button, InputFieldContainer, Section, SectionHeaderContainer } from "@/components"
import { useState } from "react";

const ContactForm =()=>{
      const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = () => {
    console.log("form submitted");
  };

  const handleValueChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
    return (
    <Section className="bg-white w-full max-w-xl shadow rounded-lg p-6">
        <SectionHeaderContainer
        heading="Send us a"
        focusText="message"
        subtext="Have questions about our payment services? We're here to help."
        />

        <Section className="space-y-3 mt-4">
        <InputFieldContainer
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleValueChange("name")}
        />

        <InputFieldContainer
            label="Email"
            type="text"
            value={formData.email}
            onChange={handleValueChange("email")}
        />

        <InputFieldContainer
            label="Subject"
            type="text"
            value={formData.subject}
            onChange={handleValueChange("subject")}
        />

        <InputFieldContainer
            label="Message"
            type="text"
            value={formData.message}
            onChange={handleValueChange("message")}
        />

        <Button
        text="Submit"
        variant="PRIMARY"
        onClick={handleSubmit}
        />
        </Section>
    </Section>
    )
}

export default ContactForm