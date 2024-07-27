export const articles = [
  {
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    abstract: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce viverra...',
    authors: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    community: 'Lorem ipsum dolor dolor',
    tags: ['gpt-3', 'deep-learning'],
    ratings: 39,
    comments: 52,
    discussions: 10,
    imageUrl: 'https://picsum.photos/200/201',
  },
  {
    title: 'Vestibulum ante ipsum primis in faucibus orci luctus et.',
    abstract:
      'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae...',
    authors: 'Vestibulum ante ipsum primis in faucibus orci luctus.',
    community: 'Vestibulum ante ipsum primis',
    tags: ['machine-learning', 'ai'],
    ratings: 45,
    comments: 60,
    discussions: 15,
    imageUrl: 'https://picsum.photos/200/201',
  },
  {
    title: 'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.',
    abstract:
      'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Proin eget tortor risus...',
    authors: 'Curabitur non nulla sit amet.',
    community: 'Curabitur non nulla',
    tags: ['data-science', 'statistics'],
    ratings: 30,
    comments: 40,
    discussions: 20,
    imageUrl: 'https://picsum.photos/200/202',
  },
  {
    title: 'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.',
    abstract:
      'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Vivamus magna justo...',
    authors: 'Praesent sapien massa',
    community: 'Praesent sapien',
    tags: ['neural-networks', 'deep-learning'],
    ratings: 50,
    comments: 70,
    discussions: 25,
    imageUrl: 'https://picsum.photos/200/203',
  },
  {
    title: 'Quisque velit nisi, pretium ut lacinia in, elementum id enim.',
    abstract:
      'Quisque velit nisi, pretium ut lacinia in, elementum id enim. Curabitur arcu erat...',
    authors: 'Quisque velit nisi',
    community: 'Quisque velit',
    tags: ['natural-language-processing', 'nlp'],
    ratings: 55,
    comments: 65,
    discussions: 30,
    imageUrl: 'https://picsum.photos/200/204',
  },
];

export const communityData = [
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Lorem Ipsum',
    description:
      'Nullam bibendum quam at sapien efficitur, sit amet dictum felis sollicitudin. Ut consequat ex vitae massa sollicitudin bibendum. Maecenas posuere sed mauris eget laoreet. Mauris consequat dictum tincidunt.',
    membersCount: 200,
    articlesCount: 10,
  },
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Dolor Sit Amet',
    description:
      'Curabitur eget elit ac turpis tempor scelerisque. Quisque at vestibulum libero, at ultrices purus. Proin euismod elit ac ligula blandit, vel laoreet erat commodo.',
    membersCount: 150,
    articlesCount: 5,
  },
  {
    imageUrl: 'https://picsum.photos/200/202',
    title: 'Consectetur Adipiscing',
    description:
      'Sed quis justo eu metus luctus efficitur. Fusce id vehicula nunc, vel gravida dui. Nulla facilisi. Donec auctor ex at nisl ultricies, sit amet cursus urna feugiat.',
    membersCount: 300,
    articlesCount: 20,
  },
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Elit Sed Do',
    description:
      'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Integer laoreet ex ac erat consectetur, sit amet dignissim metus auctor.',
    membersCount: 250,
    articlesCount: 15,
  },
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Eiusmod Tempor',
    description:
      'Mauris in felis nec sapien bibendum commodo. Nunc laoreet, nulla eu vestibulum interdum, est tortor fermentum dolor, nec ultricies tortor lacus et nulla.',
    membersCount: 175,
    articlesCount: 8,
  },
];

export const articlesData = [
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
  {
    imageUrl: 'https://picsum.photos/200/201',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
  {
    imageUrl: 'https://picsum.photos/200/202',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    likes: '1.1k',
    reviews: '2k',
  },
];

export const statsData = {
  likes: '1.2k',
  views: '2k',
  reviews: '3k',
  comments: '4k',
  discussions: '10',
  publishedDate: '13th Mar, 2021 (3 years ago)',
};

export const mockNotifications = [
  {
    id: 1,
    message: 'You have sent a join request to the Science Community.',
    isRead: false,
    link: '/community-requests',
    notificationType: 'Join Request Sent',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
  },
  {
    id: 2,
    message: 'Your invitation to join the Book Club has been approved!',
    isRead: true,
    link: '/community/book-club',
    notificationType: 'Join Based on Invite',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days from now
  },
  {
    id: 3,
    message: 'A user has requested to join your Music Lovers community.',
    isRead: false,
    link: '/community-management',
    notificationType: 'Join Request Received',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
  },
  {
    id: 4,
    message: 'New comment on your post "Latest Research on Neural Networks"',
    isRead: false,
    link: '/posts/neural-networks',
    notificationType: 'Article Commented',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day from now
  },
  {
    id: 5,
    message: 'A user replied to your post in the Health & Wellness forum.',
    isRead: true,
    link: '/forum/health-wellness',
    notificationType: 'Post Replied',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
  },
  {
    id: 6,
    message: 'A user replied to your comment on "Advancements in AI"',
    isRead: false,
    link: '/articles/ai-advancements',
    notificationType: 'Comment Replied',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
  },
];

export const MembersData = [
  {
    name: 'Lorem Ipsum',
    memberSince: 'Jun, 2020',
    reviewedArticles: 10,
    submittedArticles: 5,
    profilePicture: 'https://picsum.photos/200/200',
  },
  {
    name: 'Lorem Ipsum',
    memberSince: 'Jun, 2020',
    reviewedArticles: 1,
    submittedArticles: 2,
    profilePicture: 'https://picsum.photos/300/300',
  },
  {
    name: 'Lorem Ipsum',
    memberSince: 'Jun, 2020',
    reviewedArticles: 9,
    submittedArticles: 0,
    profilePicture: 'https://picsum.photos/400/400',
  },
  {
    name: 'Lorem Ipsum',
    memberSince: 'Jun, 2020',
    reviewedArticles: 20,
    submittedArticles: 0,
    profilePicture: 'https://picsum.photos/350/350',
  },
];

export const articleData = {
  imageUrl: 'https://picsum.photos/200/201',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  abstract:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quis nibh a neque consectetur tincidunt eget id orci. Suspendisse orci lacus, rhoncus sed velit in, condimentum vestibulum lorem. Proin a aliquet ligula, at fermentum ipsum. Etiam eleifend gravida augue, vitae vestibulum ipsum elementum a.',
  authors: 'Lorem ipsum, Ut lobortis',
  keywords: 'Nullam, vulputate, libero, quis, mollis, efficitur',
  articleLink: 'https://dinakar.co.in',
};

export const RelevantCommunities = [
  {
    image: 'https://picsum.photos/200',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    members: '200',
    articlesPublished: 10,
  },
  {
    image: 'https://picsum.photos/201',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    members: '1.2K',
    articlesPublished: 22,
  },
  {
    image: 'https://picsum.photos/202',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    members: '100',
    articlesPublished: 13,
  },
  {
    image: 'https://picsum.photos/202',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    members: '100',
    articlesPublished: 13,
  },
  {
    image: 'https://picsum.photos/202',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    members: '100',
    articlesPublished: 13,
  },
  {
    image: 'https://picsum.photos/202',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    members: '100',
    articlesPublished: 13,
  },
];

export const JoinRequests: {
  id: number;
  name: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  profilePicture: string;
}[] = [
  {
    id: 1,
    name: 'Lorem Ipsum',
    status: 'Pending',
    profilePicture: 'https://picsum.photos/200/200',
  },
  {
    id: 2,
    name: 'Lorem Ipsum',
    status: 'Pending',
    profilePicture: 'https://picsum.photos/300/300',
  },
  {
    id: 3,
    name: 'Lorem Ipsum',
    status: 'Pending',
    profilePicture: 'https://picsum.photos/400/400',
  },
  {
    id: 4,
    name: 'Lorem Ipsum',
    status: 'Accepted',
    profilePicture: 'https://picsum.photos/350/350',
  },
  {
    id: 5,
    name: 'Lorem Ipsum',
    status: 'Rejected',
    profilePicture: 'https://picsum.photos/350/350',
  },
];

export const sampleArticle = {
  title: 'Understanding React Hooks',
  submissionDate: '2023-05-15T10:00:00Z',
  author: 'Jane Doe',
  views: 3500,
  likes: 1200,
  reviewsCount: 45,
  recentReviews: [
    {
      excerpt: 'Great article! Really helped me understand hooks better.',
      date: '2024-06-18T12:34:56Z',
    },
    {
      excerpt: 'Good read, but could use more examples.',
      date: '2024-06-17T08:21:43Z',
    },
    {
      excerpt: 'Found it very informative and well-written.',
      date: '2024-06-16T15:05:22Z',
    },
  ],
  viewsOverTime: [
    { date: '2024-06-01', views: 100 },
    { date: '2024-06-02', views: 120 },
    { date: '2024-06-03', views: 150 },
    { date: '2024-06-04', views: 170 },
    { date: '2024-06-05', views: 200 },
    { date: '2024-06-06', views: 230 },
    { date: '2024-06-07', views: 300 },
  ],
  likesOverTime: [
    { date: '2024-06-01', likes: 10 },
    { date: '2024-06-02', likes: 20 },
    { date: '2024-06-03', likes: 25 },
    { date: '2024-06-04', likes: 30 },
    { date: '2024-06-05', likes: 40 },
    { date: '2024-06-06', likes: 50 },
    { date: '2024-06-07', likes: 60 },
  ],
  averageRating: 4.5,
};

const communityArticle = {
  title: 'Understanding React Hooks',
  community: 'React Enthusiasts',
  author: 'Jane Doe',
  communityViews: 1500,
  communityLikes: 500,
  communityReviewsCount: 20,
  recentCommunityReviews: [
    {
      excerpt: 'Very insightful and well-written!',
      date: '2024-06-18T12:34:56Z',
    },
    {
      excerpt: 'Helpful, but needs more examples.',
      date: '2024-06-17T08:21:43Z',
    },
    {
      excerpt: 'Excellent overview of React hooks.',
      date: '2024-06-16T15:05:22Z',
    },
  ],
  communityViewsOverTime: [
    { date: '2024-06-01', views: 50 },
    { date: '2024-06-02', views: 60 },
    { date: '2024-06-03', views: 70 },
    { date: '2024-06-04', views: 80 },
    { date: '2024-06-05', views: 90 },
    { date: '2024-06-06', views: 100 },
    { date: '2024-06-07', views: 110 },
  ],
  communityLikesOverTime: [
    { date: '2024-06-01', likes: 5 },
    { date: '2024-06-02', likes: 10 },
    { date: '2024-06-03', likes: 15 },
    { date: '2024-06-04', likes: 20 },
    { date: '2024-06-05', likes: 25 },
    { date: '2024-06-06', likes: 30 },
    { date: '2024-06-07', likes: 35 },
  ],
  averageCommunityRating: 4.7,
};

export default communityArticle;

export const reviewData = {
  author: 'Lorem Ipsum',
  rating: 3,
  date: '10:11 am, 13th Mar 2021',
  timeAgo: '1 month ago',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  content:
    'Ut id diam velit. Nam pulvinar, eros vitae egestas volutpat, enim purus commodo nisl, ac placerat neque eros id ex. In hac habitasse platea dictumst. Fusce non diam enim. Duis volutpat neque et ullamcorper rutrum. Sed vitae nibh quis justo sollicitudin sodales. Sed vehicula dolor orci, at consectetur lectus consectetur eget. Phasellus suscipit maximus nulla ut congue. Aenean aliquet ante a ipsum lacinia dapibus vel tempus erat.',
  likes: 100,
  dislikes: 0,
  replies: 10,
};

export const versions = [
  {
    rating: 5,
    content: '<p>This is the latest version of the review.</p>',
    subject: 'Excellent Product',
    edited_at: '2024-06-01T12:00:00Z',
  },
  {
    rating: 4,
    content: '<p>This is the previous version of the review.</p>',
    subject: 'Great Product',
    edited_at: '2024-05-25T12:00:00Z',
  },
  {
    rating: 3,
    content: '<p>This is an older version of the review.</p>',
    subject: 'Good Product',
    edited_at: '2024-05-15T12:00:00Z',
  },
];

export const communityStats = {
  name: 'React Enthusiasts',
  description: 'A community for React developers to share knowledge and grow together.',
  members: 1500,
  newMembersLastWeek: 30,
  totalArticles: 200,
  newArticlesLastWeek: 10,
  publishedArticles: 180,
  newPublishedArticlesLastWeek: 8,
  recentArticles: [
    {
      title: 'Advanced React Patterns',
      date: '2024-06-18T12:34:56Z',
    },
    {
      title: 'State Management with Redux',
      date: '2024-06-17T08:21:43Z',
    },
    {
      title: 'Building Custom Hooks',
      date: '2024-06-16T15:05:22Z',
    },
  ],
  totalReviews: 500,
  totalViews: 30000,
  memberGrowthData: [
    { date: '2024-06-01', members: 0 },
    { date: '2024-06-02', members: 10 },
    { date: '2024-06-03', members: 15 },
    { date: '2024-06-04', members: 16 },
    { date: '2024-06-05', members: 16 },
    { date: '2024-06-06', members: 17 },
  ],
  articleSubmissionTrendsData: [
    { date: '2024-06-01', articles: 0 },
    { date: '2024-06-02', articles: 5 },
    { date: '2024-06-03', articles: 5 },
    { date: '2024-06-04', articles: 10 },
    { date: '2024-06-05', articles: 15 },
    { date: '2024-06-06', articles: 20 },
  ],
};

export const posts = [
  {
    id: 1,
    username: 'John Doe',
    profilePicture: 'https://picsum.photos/40/40',
    createdTime: '1 hour ago',
    title: 'Beautiful Sunset',
    content:
      'I captured this stunning sunset at the beach today. The colors were absolutely breathtaking!',
    image: 'https://picsum.photos/500/300',
    likes: 42,
    comments: 12,
  },
  {
    id: 2,
    username: 'Jane Smith',
    profilePicture: 'https://picsum.photos/40/40',
    createdTime: '3 hours ago',
    title: 'My New Recipe',
    content: "Just tried this amazing new pasta recipe. It's so delicious and easy to make!",
    likes: 28,
    comments: 7,
  },
  {
    id: 3,
    username: 'Bob Johnson',
    profilePicture: 'https://picsum.photos/40/40',
    createdTime: 'Yesterday',
    title: 'Hiking Adventure',
    content: 'Went on an incredible hike this weekend. The views were spectacular!',
    image: 'https://picsum.photos/500/300',
    likes: 56,
    comments: 15,
  },
];
