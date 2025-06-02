export const faqs = [
  {
    ques: 'How are reviewers picked by the system?',
    ans: "Reviewers are chosen randomly to guarantee impartial assessments. By employing this method, the system aims to prevent any potential biases that could influence the review process. This random selection ensures that each submission receives a fair evaluation, upholding the integrity and credibility of the reviewing mechanism. It's a critical step in maintaining objectivity and trust in the review process.",
  },
  {
    ques: 'Are users assigned a random handle name for each article?',
    ans: 'Indeed, users are provided with a random handle name for each article to ensure anonymity. This system promotes unbiased interactions and feedback, as the identity of the contributor remains concealed, allowing the content to be the primary focus.',
  },
  {
    ques: 'Are users rated based on the reaction scores they receive for a review?',
    ans: 'Indeed, users are evaluated based on the reaction scores they garner for their reviews. This scoring system is instrumental in upholding the quality of reviews on our platform. By providing a metric for feedback, we can encourage constructive criticism and ensure that reviewers are motivated to offer insightful and valuable feedback. Such measures are vital to foster a credible and trustworthy review environment.',
  },
  {
    ques: 'Can I submit more than one review for an article?',
    ans: "No, each user is allowed only one review for an article to ensure diverse feedback. However, if you wish to modify or update your thoughts, you have the flexibility to edit your existing review. This ensures that you can refine your feedback while still adhering to the platform's guidelines.",
  },
  {
    ques: 'Is the review process still open after the article has been published?',
    ans: 'Yes, the review process continues even after the article has been published. By keeping it open, we encourage ongoing dialogue and ensure that authors receive continuous feedback. This approach facilitates iterative improvement and adapts to the evolving perspectives of readers and experts.',
  },
];

const PseudonymityIcon = () => {
  return (
    <svg width={32} height={32} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle fill="#E9F1FF" className="fill-bg-light" cx={20} cy={20} r={20} />
        <path fill="#4D61FC" className="fill-main" d="M20 13l7 8.235H13z" />
        <path
          stroke="#E9F1FF"
          className="stroke-light fill-secondary"
          fill="#00396B"
          d="M20 17.588L28 27H12z"
        />
      </g>
    </svg>
  );
};

const MultipleCommunityReviewIcon = () => {
  return (
    <svg width={32} height={32} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle fill="#E9F1FF" className="fill-bg-light" cx={20} cy={20} r={20} />
        <path fill="#4D61FC" className="fill-main" d="M13 13h6v6h-6zM21 13h6v6h-6zM13 21h6v6h-6z" />
        <path fill="#00396B" className="fill-secondary" d="M21 21h6v6h-6z" />
      </g>
    </svg>
  );
};

const ArticleVersioningIcon = () => {
  return (
    <svg width={32} height={32} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle fill="#E9F1FF" className="fill-bg-light" cx={20} cy={20} r={20} />
        <g transform="translate(13 15)">
          <rect
            fill="#4D61FC"
            className="fill-main"
            y={1}
            width="8.556"
            height="8.556"
            rx="4.278"
          />
          <rect
            className="fill-bg-light"
            fill="#E9F1FF"
            x="5.04"
            width="10.56"
            height="10.56"
            rx="5.28"
          />
          <rect
            className="fill-secondary"
            fill="#00396B"
            x="6.4"
            y={1}
            width="8.556"
            height="8.556"
            rx="4.278"
          />
        </g>
      </g>
    </svg>
  );
};

const DoubleBlindReviewIcon = () => {
  return (
    <svg width={32} height={32} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle fill="#E9F1FF" className="fill-bg-light" cx={20} cy={20} r={20} />
        <path fill="#4D61FC" className="fill-main" d="M13 15l6 1.92v9.6l-6-1.92z" />
        <path fill="#00396B" className="fill-secondary" d="M26 15l-6 1.92v9.6l6-1.92z" />
      </g>
    </svg>
  );
};

const RandomReviewerAssignmentIcon = () => {
  return (
    <svg width={32} height={32} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <circle fill="#E9F1FF" className="fill-bg-light" cx={20} cy={20} r={20} />
        <g fillRule="nonzero">
          <path
            d="M23.723 18.901a.287.287 0 0 0-.26-.166h-3.398l3.354-5.295a.287.287 0 0 0-.242-.44h-4.589a.287.287 0 0 0-.256.159l-4.302 8.603a.286.286 0 0 0 .257.414h2.949l-3.214 7.632a.287.287 0 0 0 .484.296l9.177-10.897a.287.287 0 0 0 .04-.306z"
            fill="#4D61FC"
            className="fill-main"
          />
          <path
            d="M26.973 18.901a.287.287 0 0 0-.26-.166h-3.398l3.354-5.295a.287.287 0 0 0-.242-.44h-4.589a.287.287 0 0 0-.256.159l-4.302 8.603a.286.286 0 0 0 .257.414h2.949l-3.214 7.632a.287.287 0 0 0 .484.296l9.177-10.897a.287.287 0 0 0 .04-.306z"
            stroke="#E9F1FF"
            className="stroke-light fill-secondary"
            fill="#00396B"
          />
        </g>
      </g>
    </svg>
  );
};

const RandomHandleNameIcon = () => {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path id="a" d="M4 4h6v6H4z" />
      </defs>
      <g fill="none" fillRule="evenodd">
        <circle fill="#E9F1FF" className="fill-bg-light" cx={20} cy={20} r={20} />
        <path fill="#4D61FC" className="fill-main" d="M21 13h6v6h-6zM13 21h6v6h-6z" />
        <g transform="translate(13 13)">
          <use fill="#00396B" className="fill-secondary" xlinkHref="#a" />
          <path stroke="#E9F1FF" className="stroke-light fill-secondary" d="M3.5 3.5h7v7h-7z" />
        </g>
      </g>
    </svg>
  );
};

export const HomeFeaturesTileData = [
  {
    icon: PseudonymityIcon(),
    heading: 'Pseudonymity',
    content:
      'An innovative open peer review website promoting Pseudonymity for unbiased feedback and evaluation.',
  },
  {
    icon: MultipleCommunityReviewIcon(),
    heading: 'Multiple Community Review',
    content:
      'An article can be reviewed by multiple communities, each community can have multiple reviewers.',
  },
  {
    icon: ArticleVersioningIcon(),
    heading: 'Article Versioning',
    content:
      'You can submit multiple versions of an article, each version can be reviewed by multiple communities.',
  },
  {
    icon: DoubleBlindReviewIcon(),
    heading: 'Double Blind Review',
    content:
      "The reviewer and the author are unaware of each other's identity. This is to ensure unbiased review.",
  },
  {
    icon: RandomReviewerAssignmentIcon(),
    heading: 'Random Reviewer Assignment',
    content: 'The reviewer is randomly assigned to an article to ensure unbiased review.',
  },
  {
    icon: RandomHandleNameIcon(),
    heading: 'Random Handle Name',
    content:
      'Every user is assigned a random handle name for each corresponding article to hide the identity of reviewers.',
  },
];

export const HashtagsList = [
  { hashtag: '#ComputerScience' },
  { hashtag: '#SoftwareDevelopment' },
  { hashtag: '#ArtificialIntelligence' },
  { hashtag: '#MachineLearning' },
  { hashtag: '#DeepLearning' },
  { hashtag: '#NeuralNetworks' },
  { hashtag: '#NaturalLanguageProcessing' },
  { hashtag: '#BigData' },
  { hashtag: '#DataMining' },
  { hashtag: '#DataAnalytics' },
  { hashtag: '#DataVisualization' },
  { hashtag: '#CyberSecurity' },
  { hashtag: '#QuantumComputing' },
  { hashtag: '#Bioinformatics' },
  { hashtag: '#Blockchain' },
  { hashtag: '#CloudComputing' },
  { hashtag: '#IoT' },
  { hashtag: '#EdgeComputing' },
  { hashtag: '#AugmentedReality' },
  { hashtag: '#VirtualReality' },
  { hashtag: '#Robotics' },
  { hashtag: '#Algorithm' },
  { hashtag: '#DistributedSystems' },
  { hashtag: '#HighPerformanceComputing' },
  { hashtag: '#ComputerVision' },
  { hashtag: '#DevOps' },
  { hashtag: '#InformationRetrieval' },
  { hashtag: '#ScientificComputing' },
  { hashtag: '#KnowledgeDiscovery' },
  { hashtag: '#ComputationalBiology' },
];

export const SCREEN_WIDTH_SM = 640; // 40rem
export const SCREEN_WIDTH_MD = 768; // 48rem
export const SCREEN_WIDTH_LG = 1024; // 64rem
export const SCREEN_WIDTH_XL = 1280; // 80rem
export const SCREEN_WIDTH_2XL = 1536; // 96rem

export const FIVE_MINUTES_IN_MS = 1000 * 60 * 5; // 5 minutes in milliseconds
export const TEN_MINUTES_IN_MS = 1000 * 60 * 10; // 10 minutes in milliseconds
export const FIFTEEN_MINUTES_IN_MS = 1000 * 60 * 15; // 15 minutes in milliseconds
export const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30; // 30 minutes in milliseconds

export const markdownStyles =
  'prose prose-sm dark:prose-invert max-w-none text-text-primary [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h4]:text-base [&_h5]:text-sm [&_h6]:text-xs [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_h4]:font-bold [&_h5]:font-bold [&_h6]:font-bold [&_h1]:mb-4 [&_h2]:mb-3 [&_h3]:mb-2 [&_h4]:mb-2 [&_h5]:mb-1 [&_h6]:mb-1 [&_hr]:border-common-contrast [&_hr]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-common-contrast [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:bg-common-minimal [&_blockquote]:italic [&_p]:my-2 [&_a]:text-functional-blue [&_a]:underline [&_a]:hover:text-functional-blueLight [&_strong]:font-bold [&_strong]:text-text-primary [&_em]:italic [&_em]:text-text-primary [&_code]:bg-common-minimal [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre]:bg-common-minimal [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_li]:my-1 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-common-contrast [&_th]:px-4 [&_th]:py-2 [&_th]:bg-common-minimal [&_th]:text-left [&_th]:font-bold [&_td]:border [&_td]:border-common-contrast [&_td]:px-4 [&_td]:py-2 [&_img]:rounded-lg [&_img]:my-4 [&_img]:w-full [&_img]:max-w-[500px] [&_del]:line-through [&_del]:text-text-tertiary [&_mark]:bg-functional-yellowLight [&_mark]:text-text-primary [&_mark]:px-1 [&_mark]:rounded [&_details]:bg-common-minimal [&_details]:p-4 [&_details]:rounded-lg [&_details]:my-4 [&_summary]:font-bold [&_summary]:cursor-pointer [&_details[open]_summary]:mb-2 [&_.admonition]:rounded-lg [&_.admonition]:border-2 [&_.admonition]:p-4 [&_.admonition]:my-4 [&_.admonition-title]:font-bold [&_.admonition-title]:mb-2 [&_.admonition-note]:bg-functional-blueLight [&_.admonition-note]:border-functional-blue [&_.admonition-note]:text-text-primary [&_.admonition-tip]:bg-functional-greenLight [&_.admonition-tip]:border-functional-green [&_.admonition-tip]:text-text-primary [&_.admonition-info]:bg-functional-blueLight [&_.admonition-info]:border-functional-blue [&_.admonition-info]:text-text-primary [&_.admonition-caution]:bg-functional-yellowLight [&_.admonition-caution]:border-functional-yellow [&_.admonition-caution]:text-text-primary [&_.admonition-danger]:bg-functional-redLight [&_.admonition-danger]:border-functional-red [&_.admonition-danger]:text-text-primary';
