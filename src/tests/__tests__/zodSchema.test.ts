import {
  emailOrUsernameSchema,
  matchPassword,
  nameSchema,
  optionalUrlSchema,
  passwordSchema,
  statusSchema,
  urlSchema,
} from '@/constants/zod-schema';

describe('nameSchema', () => {
  it('accepts international names and common separators', () => {
    const validNames = [
      'Jose',
      'Jose Alvarez',
      "O'Connor",
      'Anne-Marie',
      'Zoe',
      'Dvorak',
      '李',
      'محمد',
      'Jean Luc',
    ];

    validNames.forEach((name) => {
      expect(nameSchema.safeParse(name).success).toBe(true);
    });
  });

  it('rejects digits, symbol-only values, and whitespace-only values', () => {
    const invalidNames = ['John3', '!!!', '   ', '@name'];

    invalidNames.forEach((name) => {
      expect(nameSchema.safeParse(name).success).toBe(false);
    });
  });
});

describe('matchPassword', () => {
  it('matches confirm-password values without regex parsing side effects', () => {
    const passwordWithRegexChars = 'A[bc](12)+?$';
    const schema = matchPassword(passwordWithRegexChars);

    expect(schema.safeParse(passwordWithRegexChars).success).toBe(true);
    expect(schema.safeParse('mismatch').success).toBe(false);
  });
});

describe('emailOrUsernameSchema', () => {
  it('accepts usernames containing dots', () => {
    expect(emailOrUsernameSchema.safeParse('john.doe').success).toBe(true);
  });

  it('accepts emails with modern long TLDs', () => {
    expect(emailOrUsernameSchema.safeParse('john@domain.technology').success).toBe(true);
  });

  it('rejects malformed email inputs that previously depended on regex backtracking', () => {
    expect(emailOrUsernameSchema.safeParse('john@domain').success).toBe(false);
    expect(emailOrUsernameSchema.safeParse('john@@domain.com').success).toBe(false);
  });

  it('keeps username-character restrictions for non-email values', () => {
    expect(emailOrUsernameSchema.safeParse('john_doe').success).toBe(true);
    expect(emailOrUsernameSchema.safeParse('john-doe').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('requires complexity rules used by the signup UI', () => {
    expect(passwordSchema.safeParse('Onlyletters1').success).toBe(false);
    expect(passwordSchema.safeParse('ValidPass1!').success).toBe(true);
  });
});

describe('optionalUrlSchema', () => {
  it('allows empty profile links but validates non-empty URLs', () => {
    expect(optionalUrlSchema.safeParse('').success).toBe(true);
    expect(optionalUrlSchema.safeParse('not-a-url').success).toBe(false);
  });

  it('treats whitespace-only values as empty after parsing', () => {
    const result = optionalUrlSchema.safeParse('   ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('');
    }
  });
});

describe('urlSchema', () => {
  it('accepts valid URLs containing query strings and hash fragments', () => {
    expect(urlSchema.safeParse('https://example.com/path?x=1').success).toBe(true);
    expect(urlSchema.safeParse('https://example.com/path#section').success).toBe(true);
    expect(urlSchema.safeParse('https://example.com/path?x=1#section').success).toBe(true);
  });

  it('rejects domains with invalid subdomain labels', () => {
    expect(urlSchema.safeParse('https://-example.com/path').success).toBe(false);
  });
});

describe('statusSchema', () => {
  it('rejects whitespace-only status values', () => {
    expect(statusSchema.safeParse('   ').success).toBe(false);
    expect(statusSchema.safeParse('Researcher').success).toBe(true);
  });
});
