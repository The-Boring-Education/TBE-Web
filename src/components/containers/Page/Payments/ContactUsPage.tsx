import {
  ContactCard,
  FlexContainer,
  Section,
  ContactUsForm
} from "@/components";

const ContactUsPage = () => {
  return (
    <Section>
      <FlexContainer>
        <ContactUsForm />
      </FlexContainer>

      <ContactCard />
    </Section>
  );
};

export default ContactUsPage;
