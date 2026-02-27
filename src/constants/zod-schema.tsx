import { z } from 'zod';

export const testSchema = z
  .string()
  .min(5, { message: 'Minimum Length of 5 required' })
  .max(10, { message: 'Maximum Length of 10 required' })
  .regex(/test/, 'Invalid pattern');

export const yearSchema = z
  .string()
  .regex(/^\d{4}$/, { message: "Invalid Year Format (e.g., '2025')" });

export const yearOrPresentSchema = z
  .string()
  .regex(
    /^\d{4}$|^Present$/i,
    "Invalid year format (e.g., '2025') or 'Present' for current positions"
  );

export const scholarUrlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https:\/\//.test(url)) {
    ctx.addIssue({
      code: 'custom',
      message: "URL must start with 'https://'",
    });
  }
  const match = url.match(/^https:\/\/scholar\.google\.com\/(.*)$/);
  if (!match) {
    ctx.addIssue({
      code: 'custom',
      message:
        "URL must be a valid Google Scholar link (e.g., 'https://scholar.google.com/citations?user=xyz')",
    });
  } else {
    const path = match[1];
    if (!path || path.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: "Google Scholar URL must have a valid path after 'scholar.google.com/'",
      });
    }
  }
});

export const githubUrlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https:\/\//.test(url)) {
    ctx.addIssue({
      code: 'custom',
      message: "URL must start with 'https://'",
    });
  }
  const match = url.match(/^https:\/\/github\.com\/(.*)$/);
  if (!match) {
    ctx.addIssue({
      code: 'custom',
      message: "URL must be a valid GitHub link (e.g., 'https://github.com/username')",
    });
  } else {
    const path = match[1];
    if (!path || path.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: "GitHub URL must have a valid path after 'github.com/'",
      });
    }
  }
});

export const linkedInUrlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https:\/\//.test(url)) {
    ctx.addIssue({
      code: 'custom',
      message: "URL must start with 'https://'",
    });
  }
  const domainMatch = url.match(/^https:\/\/([a-z]{2,3})\.linkedin\.com\/(.*)$/);
  if (!domainMatch) {
    ctx.addIssue({
      code: 'custom',
      message: "Invalid LinkedIn domain format (e.g., 'https://in.linkedin.com/...')",
    });
  } else {
    const [, subdomain, path] = domainMatch;
    if (!/^[a-z]{2,3}$/.test(subdomain)) {
      ctx.addIssue({
        code: 'custom',
        message: "Invalid LinkedIn subdomain (should be 2-3 lowercase letters, e.g., 'in', 'us')",
      });
    }
    if (!path || path.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'LinkedIn URL must have a valid path after the domain',
      });
    }
  }
});

export const urlSchema = z.string().superRefine((url, ctx) => {
  if (!/^https?:\/\//.test(url)) {
    ctx.addIssue({
      code: 'custom',
      message: "URL must start with 'http://' or 'https://'",
    });
  }
  if (/\s/.test(url)) {
    ctx.addIssue({
      code: 'custom',
      message: 'URL cannot contain spaces',
    });
  }
  const domainMatch = url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/);
  if (!domainMatch) {
    ctx.addIssue({
      code: 'custom',
      message: "Invalid domain format (e.g., 'example.com')",
    });
  } else {
    const [, , subdomain, tld] = domainMatch;
    if (!/^[\da-z\.-]+$/.test(subdomain)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid characters in subdomain',
      });
    }
    if (!/^[a-z\.]{2,6}$/.test(tld)) {
      ctx.addIssue({
        code: 'custom',
        message: "Invalid TLD (e.g., '.com', '.org')",
      });
    }
  }
  if (!/^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})([\/\w\.-]*)*\/?$/.test(url)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid path format in URL',
    });
  }
});

export const passwordSchema = z
  .string({ error: 'Password must be a string' })
  .min(8, { message: 'Password must be at least 8 characters' });

export const matchPassword = (reg: RegExp) =>
  z.string().regex(reg, { message: 'Passwords do not match' });

export const emailSchema = z.string().superRefine((email, ctx) => {
  if (!email.includes('@')) {
    ctx.addIssue({
      code: 'custom',
      message: "Email must contain '@'",
    });
  }
  const [localPart, domain] = email.split('@');
  if (!localPart) {
    ctx.addIssue({
      code: 'custom',
      message: "Email must have characters before '@'",
    });
  }
  if (!domain) {
    ctx.addIssue({
      code: 'custom',
      message: "Email must have a domain after '@' (e.g., 'example.com')",
    });
  } else {
    if (!domain.includes('.')) {
      ctx.addIssue({
        code: 'custom',
        message: "Domain must contain a '.' (e.g., 'gmail.com')",
      });
    }
    const domainParts = domain.split('.');
    if (domainParts.some((part) => part.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: "Domain cannot have empty parts (e.g., 'example..com' is invalid)",
      });
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Domain contains invalid characters',
      });
    }
  }
});

export const emailOrUsernameSchema = z
  .string({ error: 'Must be a string' })
  .min(1, { message: 'This field is required' })
  .regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$|^\w+$/, {
    message: 'Enter a valid email or username (only letters, numbers, dots, underscores allowed)',
  });

export const usernameSchema = z
  .string({ error: 'Username must be a string' })
  .min(1, { message: 'Username is required' })
  .min(3, { message: 'Username must be at least 3 characters' })
  .max(30, { message: 'Username cannot exceed 30 characters' })
  .regex(/^[a-z0-9._]+$/, {
    message: 'Username must only contain lowercase letters, numbers, dots, and underscores.',
  })
  .regex(/^[a-z0-9]/, {
    message: 'Username must start with a lowercase letter or number.',
  })
  .regex(/[a-z0-9]$/, {
    message: 'Username must end with a lowercase letter or number.',
  });

const internationalNamePattern = /^[\p{L}\p{M}](?:[\p{L}\p{M}'’ -]*[\p{L}\p{M}])?$/u;

export const nameSchema = z
  .string({ error: 'Name must be a string' })
  .trim()
  .min(1, { message: 'This field is required' })
  .max(50, { message: 'Name is too long' })
  .regex(internationalNamePattern, {
    message: 'Name should contain letters only',
  });

export const researchInterestItemSchema = z
  .string()
  .regex(/^[A-Za-z\s]+$/, { message: 'Interests should only contain letters' });

export const statusSchema = z
  .string({ error: 'Status must be a string' })
  .min(1, { message: 'Status is required' })
  .max(50, { message: 'Status is too long' });

export const communityNameSchema = z
  .string({ error: 'Name must be a string' })
  .min(1, { message: 'Name is required' })
  .max(100, { message: 'Name must not exceed 100 characters' });

export const communityDescriptionSchema = z
  .string({ error: 'Description must be a string' })
  .min(1, { message: 'Description is required' })
  .max(500, { message: 'Description must not exceed 500 characters' });

export const articleTitleSchema = z
  .string({ error: 'Title must be a string' })
  .min(1, { message: 'Title is required' })
  .max(150, { message: 'Title must not exceed 150 characters' });

export const articleAbstractSchema = z
  .string({ error: 'Abstract must be a string' })
  .min(10, { message: 'Abstract must be at least 10 characters' });

export const reviewSubjectSchema = z
  .string({ error: 'Subject must be a string' })
  .min(1, { message: 'Subject is required' })
  .min(10, { message: 'Subject must be at least 10 characters' })
  .max(100, { message: 'Subject must not exceed 100 characters' });