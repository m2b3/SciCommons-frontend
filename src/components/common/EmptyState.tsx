import Image from 'next/image';

import DOMPurify from 'dompurify';

const EmptyState = ({
  logo,
  logoAlt = 'SciCommons logo',
  content,
  subcontent,
}: {
  logo?: string | React.ReactNode;
  logoAlt?: string;
  content: string;
  subcontent?: string;
}) => {
  return (
    /* Fixed by Codex on 2026-02-15
       Who: Codex
       What: Add an explicit alt text prop for empty-state logos.
       Why: Generic "logo" alt text is not descriptive to screen readers.
       How: Provide a `logoAlt` prop with a sensible default. */
    <div className="flex flex-col items-center justify-center rounded-xl bg-common-cardBackground p-8 text-text-secondary">
      {/* Fixed by Codex on 2026-02-15
         Who: Codex
         What: Remove the default empty-state alert icon.
         Why: Users found the exclamation mark icon alarming in no-data states.
         How: Comment out the fallback icon and leave the logo slot empty unless a logo is provided. */}
      <div className="mb-4">
        {logo ? (
          typeof logo === 'string' ? (
            <Image src={logo} alt={logoAlt} width={64} height={64} />
          ) : (
            logo
          )
        ) : // <AlertCircle className="h-16 w-16 text-text-tertiary" />
        null}
      </div>
      <p className="text-center text-xl font-semibold text-text-tertiary">{content}</p>
      {subcontent && (
        <div
          className="mt-2 text-center text-sm text-text-tertiary"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subcontent) }}
        />
      )}
    </div>
  );
};

export default EmptyState;
