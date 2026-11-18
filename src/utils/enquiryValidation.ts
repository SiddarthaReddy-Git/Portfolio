export interface EnquiryFormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
}

export type EnquiryField = keyof EnquiryFormValues;
export type EnquiryErrors = Partial<Record<EnquiryField, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;

export function validateEnquiryField(field: EnquiryField, rawValue: string): string | undefined {
  const value = rawValue.trim();

  switch (field) {
    case 'name': {
      if (!value) return 'Name is required.';
      if (value.length < 2) return 'Name must be at least 2 characters.';
      if (value.length > 80) return 'Name must be 80 characters or fewer.';
      return undefined;
    }
    case 'phone': {
      if (!value) return undefined;
      const digitsOnly = value.replace(/\D/g, '');
      if (!PHONE_REGEX.test(value) || digitsOnly.length < 7 || digitsOnly.length > 15) {
        return 'Enter a valid phone number (7–15 digits) or leave blank.';
      }
      return undefined;
    }
    case 'email': {
      if (!value) return 'Email address is required.';
      if (!EMAIL_REGEX.test(value) || value.length > 160) {
        return 'Please enter a valid email address.';
      }
      return undefined;
    }
    case 'message': {
      if (!value) return 'Please enter your message or project details.';
      if (value.length < 10) return 'Message must be at least 10 characters.';
      if (value.length > 2000) return 'Message must be 2,000 characters or fewer.';
      return undefined;
    }
  }
}

export function validateEnquiryForm(values: EnquiryFormValues): EnquiryErrors {
  const errors: EnquiryErrors = {};
  (Object.keys(values) as EnquiryField[]).forEach((field) => {
    const err = validateEnquiryField(field, values[field]);
    if (err) {
      errors[field] = err;
    }
  });
  return errors;
}
