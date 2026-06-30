import { useMutation } from "@tanstack/react-query";

import api from "@/lib/axios";
import type {
  DevRelOfferData,
  EmailRequest,
  EmailResponse,
  EmailTemplate,
  OfferLetterData,
} from "@/types";

export const sendEmail = async (
  emailData: EmailRequest,
): Promise<EmailResponse> => {
  try {
    const response = await api.post("/admin/email/send", emailData);
    return {
      success: true,
      message: "Email sent successfully",
      data: response.data?.data ?? response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
      data: null,
    };
  }
};

export const useSendEmail = () => {
  return useMutation({
    mutationFn: sendEmail,
    onSuccess: (data) => {
      console.log("Email sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send email:", error);
    },
  });
};

export const useSendTestEmail = () => {
  return useMutation({
    mutationFn: (emailData: EmailRequest) => sendEmail(emailData),
    onSuccess: (data) => {
      console.log("Test email sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send test email:", error);
    },
  });
};

export const useSendOfferLetter = () => {
  return useMutation({
    mutationFn: async (data: {
      template: EmailTemplate;
      offerData: OfferLetterData;
    }) => {
      const { template, offerData } = data;

      let htmlContent = template.htmlContent;
      let subject = template.subject;

      const variables = {
        "{{candidateName}}": offerData.candidateName,
        "{{candidateEmail}}": offerData.candidateEmail,
        "{{position}}": offerData.position,
        "{{department}}": offerData.department,
        "{{startDate}}": offerData.startDate,
        "{{duration}}": offerData.duration
          ? `<li><strong>Duration:</strong> ${offerData.duration}</li>`
          : "",
        "{{salary}}": offerData.salary
          ? `<li><strong>Salary:</strong> ${offerData.salary}</li>`
          : "",
        "{{location}}": offerData.location,
        "{{reportingTo}}": offerData.reportingTo
          ? `<li><strong>Reporting To:</strong> ${offerData.reportingTo}</li>`
          : "",
        "{{companyName}}": offerData.companyName || "The Boring Education",
        "{{additionalTerms}}": offerData.additionalTerms || "",
        "{{responsibilities}}": offerData.responsibilities
          .map((item) => `<li>${item}</li>`)
          .join(""),
        "{{benefits}}": offerData.benefits
          .map((item) => `<li>${item}</li>`)
          .join(""),
      };

      Object.entries(variables).forEach(([key, value]) => {
        htmlContent = htmlContent.replace(new RegExp(key, "g"), value);
        subject = subject.replace(new RegExp(key, "g"), value);
      });

      const emailRequest: EmailRequest = {
        from_email: "theboringeducation@gmail.com",
        from_name: "Sachin from The Boring Education",
        to_email: offerData.candidateEmail,
        to_name: offerData.candidateName,
        subject,
        html_content: htmlContent,
      };

      return sendEmail(emailRequest);
    },
    onSuccess: (data) => {
      console.log("Offer letter sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send offer letter:", error);
    },
  });
};

export const useSendDevRelOfferLetter = () => {
  return useMutation({
    mutationFn: async (data: {
      template: EmailTemplate;
      offerData: DevRelOfferData;
    }) => {
      const { template, offerData } = data;

      let htmlContent = template.htmlContent;
      let subject = template.subject;

      const variables = {
        "{{candidateName}}": offerData.candidateName,
        "{{candidateEmail}}": offerData.candidateEmail,
        "{{position}}": offerData.position,
        "{{startDate}}": offerData.startDate,
        "{{duration}}": offerData.duration
          ? `<li><strong>Duration:</strong> ${offerData.duration}</li>`
          : "",
        "{{salary}}": offerData.salary
          ? `<li><strong>Salary:</strong> ${offerData.salary}</li>`
          : "",
        "{{location}}": offerData.location,
        "{{reportingTo}}": offerData.reportingTo
          ? `<li><strong>Reporting To:</strong> ${offerData.reportingTo}</li>`
          : "",
        "{{responsibilities}}": offerData.responsibilities
          .map((item) => `<li>${item}</li>`)
          .join(""),
        "{{benefits}}": offerData.benefits
          .map((item) => `<li>${item}</li>`)
          .join(""),
      };

      Object.entries(variables).forEach(([key, value]) => {
        htmlContent = htmlContent.replace(new RegExp(key, "g"), value);
        subject = subject.replace(new RegExp(key, "g"), value);
      });

      const emailRequest: EmailRequest = {
        from_email: "theboringeducation@gmail.com",
        from_name: "Sachin from The Boring Education",
        to_email: offerData.candidateEmail,
        to_name: offerData.candidateName,
        subject,
        html_content: htmlContent,
      };

      return sendEmail(emailRequest);
    },
    onSuccess: (data) => {
      console.log("DevRel offer letter sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send DevRel offer letter:", error);
    },
  });
};
