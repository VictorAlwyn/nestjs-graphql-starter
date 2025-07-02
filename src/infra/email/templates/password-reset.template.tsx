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

interface PasswordResetEmailProps {
  userFirstName: string;
  resetUrl: string;
  expiryTime: string;
}

export const PasswordResetEmail = ({
  userFirstName,
  resetUrl,
  expiryTime,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset Your Password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://via.placeholder.com/150x50/007bff/ffffff?text=Logo"
            width="150"
            height="50"
            alt="Company Logo"
            style={logo}
          />

          <Heading style={h1}>Password Reset Request</Heading>

          <Text style={text}>Hi {userFirstName},</Text>

          <Text style={text}>
            We received a request to reset your password. Click the button below
            to create a new password:
          </Text>

          <Section style={buttonContainer}>
            <Link href={resetUrl} style={button}>
              Reset Password
            </Link>
          </Section>

          <Text style={text}>
            This link will expire in {expiryTime}. If you didn't request a
            password reset, you can safely ignore this email.
          </Text>

          <Text style={text}>
            If the button doesn't work, you can copy and paste this link into
            your browser:
          </Text>

          <Text style={linkText}>{resetUrl}</Text>

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
  backgroundColor: '#dc3545',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const linkText = {
  color: '#007bff',
  fontSize: '12px',
  lineHeight: '18px',
  wordBreak: 'break-all' as const,
  margin: '10px 0',
};

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};
