import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface WelcomeEmailProps {
  userFirstName: string;
  userEmail: string;
  verificationUrl?: string;
}

export const WelcomeEmail = ({
  userFirstName,
  userEmail,
  verificationUrl,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Our Platform!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50/007bff/ffffff?text=Logo"
            width="150"
            height="50"
            alt="Company Logo"
            style={logo}
          />

          <Heading style={h1}>Welcome, {userFirstName}! 🎉</Heading>

          <Text style={text}>
            Thank you for joining our platform. We're excited to have you on
            board!
          </Text>

          <Text style={text}>
            Your account has been created with the email:{' '}
            <strong>{userEmail}</strong>
          </Text>

          {verificationUrl && (
            <Section style={buttonContainer}>
              <Link href={verificationUrl} style={button}>
                Verify Your Email
              </Link>
            </Section>
          )}

          <Text style={text}>
            If you have any questions or need assistance, please don't hesitate
            to contact our support team.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '26px',
};

const buttonContainer = {
  margin: '27px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
