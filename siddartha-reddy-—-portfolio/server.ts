import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

interface EnquiryInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
  deliveryStatus: 'sent' | 'saved_pending_provider' | 'delivery_failed';
  deliveryMethod: 'resend' | 'smtp' | 'none';
  deliveryError?: string;
}

const PORT = Number(process.env.PORT || 3000);
const NOTIFICATION_EMAIL = (process.env.NOTIFICATION_EMAIL || 'siddarthareddy380@gmail.com').trim();
const DATA_DIR = path.resolve(process.cwd(), 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateEnquiry(body: unknown): {
  valid: boolean;
  data?: EnquiryInput;
  fieldErrors?: Record<string, string>;
} {
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      fieldErrors: { form: 'Invalid request payload.' },
    };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim() : '';
  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';

  const fieldErrors: Record<string, string> = {};

  if (!name) {
    fieldErrors.name = 'Please enter your name.';
  } else if (name.length < 2) {
    fieldErrors.name = 'Name must be at least 2 characters.';
  } else if (name.length > 80) {
    fieldErrors.name = 'Name must be 80 characters or fewer.';
  }

  if (!email) {
    fieldErrors.email = 'Please enter your email address.';
  } else if (!EMAIL_REGEX.test(email) || email.length > 160) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (phone) {
    const digitsOnly = phone.replace(/\D/g, '');
    if (!PHONE_REGEX.test(phone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
      fieldErrors.phone = 'Please enter a valid phone number (7–15 digits).';
    }
  }

  if (!message) {
    fieldErrors.message = 'Please enter a message or project description.';
  } else if (message.length < 10) {
    fieldErrors.message = 'Message must be at least 10 characters.';
  } else if (message.length > 2000) {
    fieldErrors.message = 'Message must be 2,000 characters or fewer.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }

  return {
    valid: true,
    data: {
      name,
      email,
      phone: phone || undefined,
      message,
    },
  };
}

async function persistEnquiry(record: EnquiryRecord): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let existing: EnquiryRecord[] = [];
    try {
      const content = await fs.readFile(ENQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {
      existing = [];
    }
    existing.unshift(record);
    await fs.writeFile(ENQUIRIES_FILE, JSON.stringify(existing.slice(0, 500), null, 2), 'utf8');
  } catch (err) {
    console.warn('Unable to write enquiries.json:', err instanceof Error ? err.message : err);
  }
}

function buildEmailContent(enquiry: EnquiryInput, createdAt: string, id: string) {
  const subject = `[Portfolio Enquiry] ${enquiry.name}`;
  const phoneDisplay = enquiry.phone || 'Not provided';
  const formattedDate = new Date(createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text = [
    'Hello Siddartha Reddy,',
    '',
    `Name: ${enquiry.name}`,
    `Phone Number: ${phoneDisplay}`,
    `Email: ${enquiry.email}`,
    '',
    'Description:',
    enquiry.message,
    '',
    `Submitted: ${formattedDate} (${id})`,
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827; font-size: 15px; line-height: 1.6;">
      <p style="margin: 0 0 18px;">Hello Siddartha Reddy,</p>
      <p style="margin: 0 0 4px;"><strong>Name:</strong> ${escapeHtml(enquiry.name)}</p>
      <p style="margin: 0 0 4px;"><strong>Phone Number:</strong> ${escapeHtml(phoneDisplay)}</p>
      <p style="margin: 0 0 18px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(enquiry.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(enquiry.email)}</a></p>
      <p style="margin: 0 0 6px;"><strong>Description:</strong></p>
      <p style="margin: 0 0 20px; white-space: pre-wrap;">${escapeHtml(enquiry.message)}</p>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">Submitted: ${escapeHtml(formattedDate)} · Ref: ${escapeHtml(id)}</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendNotificationEmail(
  enquiry: EnquiryInput,
  createdAt: string,
  id: string
): Promise<{
  status: 'sent' | 'saved_pending_provider' | 'delivery_failed';
  method: 'resend' | 'smtp' | 'none';
  error?: string;
}> {
  const { subject, text, html } = buildEmailContent(enquiry, createdAt, id);
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  if (resendApiKey) {
    try {
      const fromAddress =
        process.env.RESEND_FROM_EMAIL?.trim() || 'Portfolio Enquiry <onboarding@resend.dev>';
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [NOTIFICATION_EMAIL],
          reply_to: enquiry.email,
          subject,
          text,
          html,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Resend API delivery failed:', errBody);
        return {
          status: 'delivery_failed',
          method: 'resend',
          error: `Resend API error (${response.status})`,
        };
      }

      return { status: 'sent', method: 'resend' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Resend request error';
      console.error('Resend API exception:', msg);
      return { status: 'delivery_failed', method: 'resend', error: msg };
    }
  }

  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT || 465);
      const secure = port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Siddartha Portfolio" <${smtpUser}>`,
        to: NOTIFICATION_EMAIL,
        replyTo: `"${enquiry.name}" <${enquiry.email}>`,
        subject,
        text,
        html,
      });

      return { status: 'sent', method: 'smtp' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'SMTP transport error';
      console.error('SMTP delivery failed:', msg);
      return { status: 'delivery_failed', method: 'smtp', error: msg };
    }
  }

  console.info(
    `[Enquiry Saved - Email Provider Not Configured] To: ${NOTIFICATION_EMAIL} | From: ${enquiry.name} <${enquiry.email}> | ID: ${id}`
  );
  return { status: 'saved_pending_provider', method: 'none' };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const validation = validateEnquiry(req.body);
    if (!validation.valid || !validation.data) {
      res.status(400).json({
        success: false,
        error: 'Please correct the highlighted fields and try again.',
        fieldErrors: validation.fieldErrors || {},
      });
      return;
    }

    const enquiry = validation.data;
    const id = `ENQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    const delivery = await sendNotificationEmail(enquiry, createdAt, id);

    const record: EnquiryRecord = {
      id,
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone || null,
      message: enquiry.message,
      createdAt,
      deliveryStatus: delivery.status,
      deliveryMethod: delivery.method,
      deliveryError: delivery.error,
    };

    await persistEnquiry(record);

    if (delivery.status === 'delivery_failed') {
      res.status(502).json({
        success: false,
        id,
        deliveryStatus: delivery.status,
        error:
          'Your enquiry was saved, but the email notification server failed to dispatch. Please verify SMTP or Resend credentials.',
      });
      return;
    }

    const message =
      delivery.status === 'sent'
        ? `Thank you, ${enquiry.name}! Your enquiry has been sent and Siddartha has been notified at ${NOTIFICATION_EMAIL}.`
        : `Thank you, ${enquiry.name}! Your enquiry was received and saved (${id}). Add SMTP or Resend credentials in environment secrets to enable live email dispatch to ${NOTIFICATION_EMAIL}.`;

    res.status(201).json({
      success: true,
      id,
      createdAt,
      deliveryStatus: delivery.status,
      recipientEmail: NOTIFICATION_EMAIL,
      message,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*path', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
