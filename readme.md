# SciCommons  

The changing landscape of academic publishing requires robust, transparent, and faster review systems. The Sci-commons portal, developed during Google Summer of Code 2023, addresses these challenges by combining traditional peer review mechanisms with community-driven open-review systems. Additionally, the platform champions anonymous reviews to ensure ethical and unbiased feedback.

# Features and Implementation:
* **Multi-community Submission:**
Enables scholars to reach diverse audiences by submitting to various communities.
Parallel reviews provide a plethora of feedback.
* **Open Reviewing System:**
Beyond official reviewers, any registered user can offer insights, increasing the depth and breadth of reviews.
Articles can be rated, facilitating community-driven quality checks.
* **Anonymous Reviewing:**
Unique random handles are assigned to reviewers, ensuring anonymity.
Promotes ethical, unbiased, and objective reviews.
* **Automated Peer-Review Process:**
Initial reviews by community admins act as a preliminary filter.
Randomized assignment of official reviewers and moderators ensures an unbiased peer-review process.
* **Reputation-Based System:**
Reviewers gain or lose reputation based on community reactions to their reviews.
Encourages quality feedback and separates users based on review reliability.
* **Article-specific Chat Page:**
A dedicated space for informal discussions around submitted articles.
Ensures that the review section remains focused and clutter-free.

# Tech Stack

**Client:** React, JavaScript, TailwindCSS

# Live Site

[Live Site Link](https://www.scicommons.org/)

# Run Locally

## Clone the project

```bash 
    git clone https://github.com/m2b3/SciCommons-frontend
    cd SciCommons-frontend
```

## Install dependencies

```bash
    npm install
```

## Run the frontend

```bash
    npm run start
```
## [GSOC REPORT](https://gist.github.com/JyothiSwaroopReddy07/89c56164a48a833e2bfdc8a5256c46d1)


# Screenshots

* **Login Page:** Used for User Login
![LoginPage](https://user-images.githubusercontent.com/107217455/274799626-2c1b5fa4-90df-4d97-9d24-fe044fa5eba9.png)

* **Register Page:** Used for user registration contains password policy and detects form errors.
![RegisterPage](https://user-images.githubusercontent.com/107217455/274799678-a760a772-6bef-4fa9-b955-76d2c3775c7c.png)

* **Home Page:** this is landing page of website
![HomePage](https://user-images.githubusercontent.com/107217455/274799573-24cd8425-029d-4f8d-8a22-a4f93914768c.png)
																
* **Submit Article Page:** the user can submit their article from this page

![SubmitArticlePage](https://user-images.githubusercontent.com/107217455/274804029-d72b3eb8-3eab-4c23-b280-515238927e4a.png)

* **Submit Pubmed Article:** the user can submit an exsiting pubmed article using pubmed api.
![Pubmedapi article](https://user-images.githubusercontent.com/107217455/274810750-0c4b14d5-ea53-4ec4-a832-ae8b6e957c7e.png)



* **All Communities Page:** This displays all the communities associated with scicommons
![AllCommunitiesPage](https://user-images.githubusercontent.com/107217455/274799775-1f738c30-d28d-47cc-961c-c9c453e4fd72.png)

* **All Articles Page:** This displays all the articles submitted to scicommons
![AllArticlesPage](https://user-images.githubusercontent.com/107217455/274799803-82d77087-d0d4-4088-8106-95478389c954.png)

* **Profile Page:** Displays user details, his posts,articles, user info
![ProfilePage-1](https://user-images.githubusercontent.com/107217455/274802644-698b82a7-6b00-4c0d-b5f1-7a66d2e326b9.png)
![ProfilePage-2](https://user-images.githubusercontent.com/107217455/274802673-70ac6f3c-8313-4266-a37b-a388697997f1.png)
![ProfilePage-3](https://user-images.githubusercontent.com/107217455/274802710-373c4d70-55ca-4d0d-94ab-cfc95323501a.png)


* **Posts Page:** this is user feed where the posts of all users are visible
![UserFeedPage](https://user-images.githubusercontent.com/107217455/274802793-d9bb5977-47bb-4041-b838-ac4a91949621.png)
																
* **Single Post Page:** this is page to view comments of a post,reply to comments
![SinglePostPage](https://user-images.githubusercontent.com/107217455/274802831-d330f4ba-ce21-4f0a-b8ca-261d9c385d86.png)

* **Article Page:** this is page to display article details and reviews it recieved
![ArticlePage](https://user-images.githubusercontent.com/107217455/274802885-586111e8-e74b-458f-9e6b-d18c1b167ba0.png)

* **Article Chat Page:** this page is used to display chats related to an article
![Article Chat Page](https://user-images.githubusercontent.com/107217455/274803769-8cc795aa-92a5-4b63-97dc-899b7bf80676.png)


* **Notifications Page:** this page displays notifications of user
![Screenshot (42)](https://user-images.githubusercontent.com/107217455/274803597-388e67f9-265f-4836-9e94-2d2c03ab9d3a.png)


* **Forgot Password Page:** this page is used to reset password using otp
![ForgotPassword](https://user-images.githubusercontent.com/107217455/274802941-5db93377-b7cf-4e43-b07b-80e58cdea951.png)

* **Email Verification Page:** this page is used to verify email address of user
![VerificationPage](https://user-images.githubusercontent.com/107217455/274802973-8756d804-8c65-40a9-84dd-d925302d24b6.png)

* **Create Community Page:** this page is used to create new community
![CreateCommunityPage](https://user-images.githubusercontent.com/107217455/274802999-ce551803-2cd7-4ab9-b64d-31efe5f2e531.png)

* **Join Request Form Page:** this page is used to submit a join request to a community by any user
![JoinRequestForm](https://user-images.githubusercontent.com/107217455/274803021-b8cc65be-0c28-4aa3-890a-32ccc1ef7856.png)

* **Admin Community Edit Page:** Page is only accessed by admin of community to edit details of community
![CommunityEditPage](https://user-images.githubusercontent.com/107217455/274803066-aeccb074-f07a-4e48-a113-12c0c11abd14.png)

* **Admin Article Page:** page is used by admin of community to accept/reject the submitted articles, add publish info to article
![AdminArticlePage](https://user-images.githubusercontent.com/107217455/274803094-7ccff104-0a25-4692-840c-a117c7098f60.png)

* **Admin Members Table Page:** Used by admin to promote or demote users based on their roles.
![CommunityMembers Page](https://user-images.githubusercontent.com/107217455/274803148-c5d3c636-f69f-4642-9ec2-835743bf60fa.png)

* **Author Article Page:** Used to edit articles, add article to new communities.
![AuthorArticlePage](https://user-images.githubusercontent.com/107217455/274803195-19f944b8-0a2e-47cd-8531-0c60e159cc8f.png)

* **My Profile Page:** Used by user to edit the profile page
![Screenshot (41)](https://user-images.githubusercontent.com/107217455/274803469-8d74a9bd-dd10-4bf6-90cd-9f4242afe1c8.png)


* **Review Form:** Used to submit a review to an article
![ReviewForm](https://user-images.githubusercontent.com/107217455/274803255-0f48e7d7-8283-450e-9576-0d4a0a684eb2.png)

* **Post Form:** Used to post a post in feed.
![PostForm](https://user-images.githubusercontent.com/107217455/274803276-940b7f72-afbc-40c3-ad27-8b725de03528.png)

* **Comment Form:** Used to post a comment to review or decision
![CommentForm](https://user-images.githubusercontent.com/107217455/274803300-7a427a7d-df48-4366-8bd1-d9245822e519.png)





