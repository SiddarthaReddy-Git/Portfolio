import { useId, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  User,
  X,
} from 'lucide-react';
import {
  validateEnquiryField,
  validateEnquiryForm,
  type EnquiryErrors,
  type EnquiryField,
  type EnquiryFormValues,
} from '../utils/enquiryValidation';

interface EnquiryResponse {
  success: boolean;
  id?: string;
  createdAt?: string;
  deliveryStatus?: 'sent' | 'saved_pending_provider' | 'delivery_failed';
  recipientEmail?: string;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

interface EnquiryFormCardProps {
  onClose?: () => void;
  headingId?: string;
}

const INITIAL_VALUES: EnquiryFormValues = {
  name: '',
  phone: '',
  email: '',
  message: '',
};

export function EnquiryFormCard({ onClose, headingId }: EnquiryFormCardProps) {
  const uid = useId();
  const [values, setValues] = useState<EnquiryFormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<EnquiryField, boolean>>>({});
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<EnquiryResponse | null>(null);

  const handleChange = (field: EnquiryField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (touched[field] || errors[field]) {
      const nextErr = validateEnquiryField(field, value);
      setErrors((prev) => ({ ...prev, [field]: nextErr }));
    }
  };

  const handleBlur = (field: EnquiryField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateEnquiryField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateEnquiryForm(values);
    setTouched({ name: true, phone: true, email: true, message: true });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const trimmedPayload = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      };

      let payload: EnquiryResponse;
      try {
        const response = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trimmedPayload),
        });

        const parsed = (await response.json().catch(() => null)) as EnquiryResponse | null;
        if (!parsed) {
          payload = {
            success: true,
            deliveryStatus: 'saved_pending_provider',
            recipientEmail: 'siddarthareddy380@gmail.com',
          };
        } else {
          payload = parsed;
          if (!response.ok || !payload.success) {
            if (payload.fieldErrors) {
              setErrors((prev) => ({
                ...prev,
                ...(payload.fieldErrors as EnquiryErrors),
              }));
            }
            setServerError(
              payload.error || 'Unable to send your enquiry right now. Please try again.'
            );
            return;
          }
        }
      } catch {
        payload = {
          success: true,
          deliveryStatus: 'saved_pending_provider',
          recipientEmail: 'siddarthareddy380@gmail.com',
        };
      }

      let finalResult: EnquiryResponse = payload;

      // When no server SMTP/Resend credentials are configured, deliver via FormSubmit so Siddartha still receives every enquiry
      if (payload.deliveryStatus === 'saved_pending_provider') {
        const targetEmail = payload.recipientEmail || 'siddarthareddy380@gmail.com';
        const formSubmitTarget =
          targetEmail === 'siddarthareddy380@gmail.com'
            ? 'a7cc13b8eff669143b2f0823b66c430a'
            : encodeURIComponent(targetEmail);

        try {
          const fsResponse = await fetch(
            `https://formsubmit.co/ajax/${formSubmitTarget}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                Name: trimmedPayload.name,
                Email: trimmedPayload.email,
                ...(trimmedPayload.phone ? { 'Phone Number': trimmedPayload.phone } : {}),
                Message: trimmedPayload.message,
                _subject: `[Portfolio Enquiry] ${trimmedPayload.name}`,
                _replyto: trimmedPayload.email,
                _template: 'basic',
                _captcha: 'false',
                _url: window.location.href,
              }),
            }
          );

          const fsData = (await fsResponse.json().catch(() => null)) as {
            success?: boolean | string;
            message?: string;
          } | null;

          if (fsResponse.ok && (fsData?.success === true || fsData?.success === 'true')) {
            finalResult = {
              ...payload,
              deliveryStatus: 'sent',
              message: `Thank you, ${trimmedPayload.name}! Your enquiry has been sent directly to ${targetEmail}.`,
            };
          } else if (fsData?.message && fsData.message.toLowerCase().includes('activate')) {
            finalResult = {
              ...payload,
              deliveryStatus: 'saved_pending_provider',
              message: `Thank you, ${trimmedPayload.name}! Your enquiry was saved (${payload.id}). To receive submissions in ${targetEmail}, click "Activate Form" once in the FormSubmit email sent to your inbox.`,
            };
          } else {
            setServerError(
              fsData?.message ||
                `Your enquiry (${payload.id}) was saved, but direct email delivery could not complete. Please try again or email ${targetEmail} directly.`
            );
            return;
          }
        } catch {
          setServerError(
            `Your enquiry (${payload.id}) was saved, but the email gateway could not be reached. Please email ${targetEmail} directly.`
          );
          return;
        }
      }

      setSubmittedResult(finalResult);
      setValues(INITIAL_VALUES);
      setTouched({});
      setErrors({});
    } catch {
      setServerError('Network error while sending your enquiry. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedResult(null);
    setServerError(null);
    setValues(INITIAL_VALUES);
    setTouched({});
    setErrors({});
  };

  const nameId = `${uid}-name`;
  const phoneId = `${uid}-phone`;
  const emailId = `${uid}-email`;
  const messageId = `${uid}-message`;

  return (
    <div className="enquiry-glass-card enquiry-glass-border relative w-full rounded-[28px] overflow-hidden backdrop-blur-xl text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#a855f7]/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-16 w-80 h-80 rounded-full bg-[#38bdf8]/25 blur-3xl"
      />

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close enquiry dialog"
          className="absolute top-4 right-4 z-20 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/8 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-10 lg:p-12 items-center">
        <div className="lg:col-span-5 flex flex-col items-start">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1a1f4a]/80 border border-indigo-400/35 text-xs sm:text-sm font-medium text-indigo-100 shadow-inner">
            <Mail className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />
            <span>Get In Touch</span>
          </div>

          <h2
            id={headingId}
            className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.06] text-white"
          >
            Send an{' '}
            <span className="block bg-gradient-to-r from-[#d896ff] via-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
              Enquiry
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300 max-w-sm">
            Have a question, project idea, or just want to say hello? I&apos;d love to hear from
            you!
          </p>

          <div
            aria-hidden="true"
            className="mt-6 w-14 h-[2px] rounded-full bg-gradient-to-r from-indigo-400 to-sky-400"
          />

          <div className="mt-8 w-full max-w-[270px] select-none" aria-hidden="true">
            <svg viewBox="0 0 280 140" className="w-full h-auto drop-shadow-[0_12px_28px_rgba(56,189,248,0.28)]">
              <defs>
                <linearGradient id="envBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.48" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="envStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e0e7ff" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              <ellipse
                cx="118"
                cy="98"
                rx="96"
                ry="22"
                transform="rotate(-11 118 98)"
                fill="none"
                stroke="url(#envStroke)"
                strokeOpacity="0.35"
                strokeWidth="1.2"
              />

              <path
                d="M175 66 Q205 56 226 38"
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray="4 4"
                opacity="0.7"
              />

              <g transform="translate(36, 46) rotate(-9)">
                <rect
                  x="0"
                  y="0"
                  width="126"
                  height="78"
                  rx="12"
                  fill="url(#envBody)"
                  stroke="url(#envStroke)"
                  strokeWidth="1.8"
                />
                <path
                  d="M4 5 L63 45 L122 5"
                  fill="none"
                  stroke="url(#envStroke)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 73 L46 40 M121 73 L80 40"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeOpacity="0.45"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </g>

              <g transform="translate(216, 12)">
                <polygon
                  points="0,24 44,4 28,42 18,28"
                  fill="url(#planeGrad)"
                  stroke="#ffffff"
                  strokeOpacity="0.85"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <polygon points="18,28 44,4 22,33" fill="#1e3a8a" opacity="0.45" />
              </g>

              <path
                d="M28 52 L31 58 L37 61 L31 64 L28 70 L25 64 L19 61 L25 58 Z"
                fill="#c4b5fd"
                opacity="0.85"
              />
              <path
                d="M196 44 L198 48 L202 50 L198 52 L196 56 L194 52 L190 50 L194 48 Z"
                fill="#7dd3fc"
                opacity="0.85"
              />
            </svg>
          </div>
        </div>

        <div className="lg:col-span-7 w-full">
          {submittedResult ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-[#141842]/80 border border-sky-400/35 p-6 sm:p-8 text-center"
            >
              <div
                className={`mx-auto w-14 h-14 rounded-2xl border flex items-center justify-center ${
                  submittedResult.deliveryStatus === 'sent'
                    ? 'bg-gradient-to-br from-emerald-400/25 to-sky-400/25 border-emerald-300/40 text-emerald-300'
                    : 'bg-gradient-to-br from-amber-400/25 to-sky-400/25 border-amber-300/40 text-amber-300'
                }`}
              >
                {submittedResult.deliveryStatus === 'sent' ? (
                  <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-7 h-7" aria-hidden="true" />
                )}
              </div>

              <h3 className="mt-5 text-xl sm:text-2xl font-bold text-white">
                {submittedResult.deliveryStatus === 'sent'
                  ? 'Enquiry Sent'
                  : 'Enquiry Saved (Email Setup Needed)'}
              </h3>

              <p className="mt-2.5 text-sm sm:text-base text-slate-200 leading-relaxed max-w-md mx-auto">
                {submittedResult.message}
              </p>

              {submittedResult.id && (
                <p className="mt-4 text-xs text-slate-400 tabular-nums">
                  Reference ID: <span className="text-sky-300 font-semibold">{submittedResult.id}</span>
                  {' · '}
                  Recipient: <span className="text-slate-200">{submittedResult.recipientEmail}</span>
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 min-h-[44px] rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#b64dff] via-[#7c5cff] to-[#38bdf8] hover:brightness-110 transition-all shadow-[0_8px_28px_-6px_rgba(99,102,241,0.75)] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  <span>Send Another Enquiry</span>
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center justify-center px-5 min-h-[44px] rounded-full text-sm font-medium text-slate-200 bg-white/8 hover:bg-white/15 border border-white/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Back to Portfolio
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-300" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label htmlFor={nameId} className="sr-only">
                  Your Name (required)
                </label>
                <div
                  className={`flex items-center gap-3 px-4 min-h-[50px] rounded-xl bg-[#19204d]/75 border transition-colors ${
                    errors.name
                      ? 'border-rose-400/80 focus-within:border-rose-400'
                      : 'border-indigo-300/25 focus-within:border-sky-400/75'
                  }`}
                >
                  <User className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your Name *"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${nameId}-err` : undefined}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none py-2.5"
                  />
                </div>
                {errors.name && (
                  <p id={`${nameId}-err`} className="mt-1.5 text-xs text-rose-300 flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={phoneId} className="sr-only">
                  Your Phone Number (optional)
                </label>
                <div
                  className={`flex items-center gap-3 px-4 min-h-[50px] rounded-xl bg-[#19204d]/75 border transition-colors ${
                    errors.phone
                      ? 'border-rose-400/80 focus-within:border-rose-400'
                      : 'border-indigo-300/25 focus-within:border-sky-400/75'
                  }`}
                >
                  <Phone className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Your Phone Number (Optional)"
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? `${phoneId}-err` : undefined}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none py-2.5"
                  />
                </div>
                {errors.phone && (
                  <p id={`${phoneId}-err`} className="mt-1.5 text-xs text-rose-300 flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={emailId} className="sr-only">
                  Your Email Address (required)
                </label>
                <div
                  className={`flex items-center gap-3 px-4 min-h-[50px] rounded-xl bg-[#19204d]/75 border transition-colors ${
                    errors.email
                      ? 'border-rose-400/80 focus-within:border-rose-400'
                      : 'border-indigo-300/25 focus-within:border-sky-400/75'
                  }`}
                >
                  <Mail className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Your Email Address *"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${emailId}-err` : undefined}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none py-2.5"
                  />
                </div>
                {errors.email && (
                  <p id={`${emailId}-err`} className="mt-1.5 text-xs text-rose-300 flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor={messageId} className="sr-only">
                  Your Description or Message (required)
                </label>
                <div
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-[#19204d]/75 border transition-colors ${
                    errors.message
                      ? 'border-rose-400/80 focus-within:border-rose-400'
                      : 'border-indigo-300/25 focus-within:border-sky-400/75'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-slate-300 shrink-0 mt-1" aria-hidden="true" />
                  <textarea
                    id={messageId}
                    name="message"
                    required
                    rows={4}
                    maxLength={2000}
                    placeholder="Your Description / Message... *"
                    value={values.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? `${messageId}-err` : `${messageId}-hint`}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none resize-y min-h-[104px]"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3 px-1">
                  {errors.message ? (
                    <p id={`${messageId}-err`} className="text-xs text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{errors.message}</span>
                    </p>
                  ) : (
                    <span id={`${messageId}-hint`} className="text-xs text-slate-400">
                      Minimum 10 characters
                    </span>
                  )}
                  <span className="text-xs text-slate-400 tabular-nums shrink-0">
                    {values.message.trim().length} / 2000
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center sm:justify-start">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2.5 px-8 min-h-[48px] rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#c04dff] via-[#7c5cff] to-[#38bdf8] hover:brightness-110 disabled:opacity-65 transition-all duration-150 shadow-[0_10px_32px_-6px_rgba(99,102,241,0.7)] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Sending Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
