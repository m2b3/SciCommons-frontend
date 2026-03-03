import { z } from 'zod';

import { passwordRegex } from '@/lib/formValidation';

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
  /* Fixed by Codex on 2026-03-01
     Who: Codex
     What: Replaced backtracking-prone URL regex checks with URL parsing and deterministic hostname/path validation.
     Why: CodeQL flagged the previous nested-quantifier regex as vulnerable to inefficient matching (ReDoS risk).
     How: Parse once with the platform URL parser, validate hostname labels/TLD with linear checks, and keep explicit path validation without ambiguous regex structure. */
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'Invalid URL format',
    });
  }

  if (parsedUrl) {
    const hostname = parsedUrl.hostname.toLowerCase();
    const hostnameParts = hostname.split('.');

    if (hostnameParts.length < 2 || hostnameParts.some((part) => part.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        message: "Invalid domain format (e.g., 'example.com')",
      });
    } else {
      const subdomainParts = hostnameParts.slice(0, -1);
      if (
        subdomainParts.some(
          (part) => !/^[a-z0-9-]+$/.test(part) || part.startsWith('-') || part.endsWith('-')
        )
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid characters in subdomain',
        });
      }

      const tld = hostnameParts[hostnameParts.length - 1];
      if (!/^[a-z]{2,6}$/.test(tld)) {
        ctx.addIssue({
          code: 'custom',
          message: "Invalid TLD (e.g., '.com', '.org')",
        });
      }
    }

    if (!/^\/[^\s]*$/.test(parsedUrl.pathname)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Invalid path format in URL',
      });
    }
  }
});

/* Fixed by Codex on 2026-03-03
   Who: Codex
   What: Normalize optional profile-link inputs before URL validation.
   Why: The resolver migration needed specific URL error messages (no union fallback) while still treating blank/whitespace-only values as optional.
   How: Trim inputs first; treat blank strings as valid optional values; otherwise run the strict URL schema and forward its specific issues. */
const optionalTrimmedStringSchema = (schema: z.ZodString) =>
  z.string().transform((value) => value.trim()).superRefine((value, ctx) => {
    if (value.length === 0) {
      return;
    }
    const result = schema.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: 'custom',
          message: issue.message,
        });
      }
    }
  });

export const optionalScholarUrlSchema = optionalTrimmedStringSchema(scholarUrlSchema);
export const optionalGithubUrlSchema = optionalTrimmedStringSchema(githubUrlSchema);
export const optionalLinkedInUrlSchema = optionalTrimmedStringSchema(linkedInUrlSchema);
export const optionalUrlSchema = optionalTrimmedStringSchema(urlSchema);

export const passwordSchema = z
  .string({ error: 'Password must be a string' })
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(passwordRegex, {
    message:
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

/* Fixed by Codex on 2026-02-27
   Who: Codex
   What: Replace regex-based confirm-password matching with direct string comparison.
   Why: Building regular expressions from raw passwords can throw and mis-validate regex metacharacters.
   How: Compare confirm password and source password with a custom zod issue instead of RegExp construction. */
export const matchPassword = (password: string) =>
  z.string().superRefine((confirmPassword, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
      });
    }
  });

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
  /* Fixed by Codex on 2026-03-01
     Who: Codex
     What: Replaced email-or-username regex with deterministic parsing/character checks.
     Why: Proactively remove repeated-group regex risk patterns flagged in adjacent CodeQL ReDoS remediation work.
     How: Branch on email vs username by '@', then validate parts with linear character checks and explicit domain/TLD constraints. */
  .superRefine((input, ctx) => {
    const invalidMessage =
      'Enter a valid email or username (only letters, numbers, dots, underscores allowed)';

    const isAlphaNumeric = (char: string) => /^[A-Za-z0-9]$/.test(char);
    const isWordChar = (char: string) => char === '_' || isAlphaNumeric(char);
    const hasOnlyAllowedChars = (value: string, checker: (char: string) => boolean) => {
      if (!value) return false;
      for (const char of value) {
        if (!checker(char)) return false;
      }
      return true;
    };

    const atSymbolCount = [...input].filter((char) => char === '@').length;
    if (atSymbolCount > 1) {
      ctx.addIssue({ code: 'custom', message: invalidMessage });
      return;
    }

    if (input.includes('@')) {
      const [localPart = '', domainPart = ''] = input.split('@');
      if (
        !hasOnlyAllowedChars(localPart, (char) => isWordChar(char) || char === '-' || char === '.')
      ) {
        ctx.addIssue({ code: 'custom', message: invalidMessage });
        return;
      }

      const domainLabels = domainPart.split('.');
      if (domainLabels.length < 2 || domainLabels.some((label) => label.length === 0)) {
        ctx.addIssue({ code: 'custom', message: invalidMessage });
        return;
      }

      const tld = domainLabels[domainLabels.length - 1];
      const subdomainLabels = domainLabels.slice(0, -1);

      const isDomainLabelValid = (label: string) =>
        hasOnlyAllowedChars(label, (char) => isWordChar(char) || char === '-');
      if (!subdomainLabels.every(isDomainLabelValid)) {
        ctx.addIssue({ code: 'custom', message: invalidMessage });
        return;
      }

      if (!isDomainLabelValid(tld) || tld.length < 2 || tld.length > 63) {
        ctx.addIssue({ code: 'custom', message: invalidMessage });
      }
      return;
    }

    if (!hasOnlyAllowedChars(input, (char) => isWordChar(char) || char === '.')) {
      ctx.addIssue({ code: 'custom', message: invalidMessage });
    }
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
  .trim()
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

export const bioSchema = z
  .string({ error: 'Bio must be a string' })
  .max(500, { message: 'Bio must not exceed 500 characters' })
  .optional();

export const professionalStatusSchema = z.object({
  status: statusSchema,
  startYear: z.string()
    .regex(/^\d{4}$/, "Start year must be a 4-digit number (e.g., '2020')")
    .refine((val) => {
      const year = parseInt(val, 10);
      return year >= 1950 && year <= new Date().getFullYear();
    }, "Start year must be between 1950 and the current year"),
  endYear: z.string().transform((value) => value.trim()),
  isOngoing: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
  const currentYear = new Date().getFullYear();

  if (!data.isOngoing) {
    if (!data.endYear || !/^\d{4}$/.test(data.endYear)) {
      ctx.addIssue({
        code: 'custom',
        path: ['endYear'],
        message: "Valid 4-digit end year is required",
      });
      return;
    }
    const start = parseInt(data.startYear, 10);
    const end = parseInt(data.endYear, 10);
    if (end > currentYear) {
      ctx.addIssue({
        code: 'custom',
        path: ['endYear'],
        message: "End year cannot be in the future",
      });
    }
    if (end < start) {
      ctx.addIssue({
        code: 'custom',
        path: ['endYear'],
        message: "End year must be after start year",
      });
    }
  }
});

export const profileMasterSchema = z.object({
  /* Fixed by Codex on 2026-03-03
     Who: Codex
     What: Keep read-only username validation aligned with existing profile UX.
     Why: Applying full signup username constraints here can block profile saves for immutable legacy usernames.
     How: Require non-empty username in profile form while leaving strict format rules to signup/update-username flows. */
  username: z.string().min(1, { message: 'Username is required' }),
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  bio: z.string().max(500, "Bio must not exceed 500 characters"),
  homePage: optionalUrlSchema,
  linkedIn: optionalLinkedInUrlSchema,
  github: optionalGithubUrlSchema,
  googleScholar: optionalScholarUrlSchema,
  professionalStatuses: z.array(professionalStatusSchema),
  researchInterests: z.array(
    z.object({
      label: researchInterestItemSchema,
      value: z.string(),
    })
  ),
  profilePicture: z.any().optional(),
});
