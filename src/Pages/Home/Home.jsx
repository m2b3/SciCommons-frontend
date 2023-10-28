import React from "react";
import "./Home.css";
import NavBar from "../../Components/NavBar/NavBar";

const Home = () => {
  return (
    <>
      <NavBar />
      <div  className="custom-google-fonts-enabled comps" id="107237-212152">
        <div
           className="page-component__bg_image_box    bg-medium-color  "
          id="header-23-256551"
        >
          <div  className="page-component__bg_overlay_box " />
          <div
             className="page-component__wrapper bg-[#ebfde8]"
            style={{ zIndex: 14, paddingTop: 70, paddingBottom: 70 }}
          >
            <header  className="header-23 graphics-image default-graphics-image">
              <div  className="container container--large header-23__container">
                <div  className="header-23__left">
                  <div  className="header-23__left_content">
                    <h1  className="heading heading--accent header-23__heading ">
                      Welcome to SciCommons
                    </h1>
                    <div  className="header-23__text content_box ">
                      An open peer review platform for efficient and anonymous
                      article reviewal.
                    </div>
                    <div  className="header-23__cta_box">
                      <div  className="buttons-set">
                        <ul  className="buttons-set__list ">
                          <li  className="buttons-set__item ">
                            <a
                              data-stripe-product-id=""
                              data-stripe-mode="payment"
                              data-successful-payment-url=""
                              data-cancel-payment-url=""
                               className="button border-4 border-green-500 text-green-500 font-semibold rounded-md"
                              href="/register"
                              target="_blank"
                              style={{"border":"2px solid #10b981"}}
                            >
                              <span  className="button__text">Get Started</span>
                            </a>
                          </li>
                        </ul>
                        <div  className="content_box cta_bottom_info ">
                          Join us and make the reviewal process fast and
                          efficient.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div  className="header-23__right">
                  <img
                     className="header-23__img"
                    alt="Lime illustration"
                    src="https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png"
                    srcSet="https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=249&height=300 249w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=249&height=300 249w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=249&height=300 249w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=249&height=300 249w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=415&height=500 415w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=415&height=500 415w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=498&height=600 498w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=498&height=600 498w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=498&height=600 498w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=498&height=600 498w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=830&height=1000 830w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=830&height=1000 830w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=747&height=900 747w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=747&height=900 747w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=747&height=900 747w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=747&height=900 747w,https://unicorn-cdn.b-cdn.net/fc5b0188-ec46-4386-8458-44ea0b48f3c9/lime-illustration.png?width=886&height=1068 886w,"
                    sizes="(max-width: 320px) 249px,(max-width: 375px) 249px,(max-width: 425px) 249px,(max-width: 600px) 249px,(max-width: 1020px) 415px,415px"
                  />
                </div>
              </div>
            </header>
          </div>
        </div>
        <div
           className="page-component__bg_image_box    bg-white-color  "
          id="tabs-03-581951"
        >
          <div  className="page-component__bg_overlay_box " />
          <div
             className="page-component__wrapper"
            style={{ zIndex: 13, paddingTop: 50, paddingBottom: 50 }}
          >
            <div  className="tabs-03 graphics-video default-graphics-image">
              <div  className="container container--small">
                <div  className="title-box title-box--center">
                  <h2  className="heading ">How It Works</h2>
                  <div  className="title-box__text content_box ">
                    Simplified steps to get your article reviewed.
                  </div>
                </div>
              </div>
              <div  className="container">
                <div  className="tabs-03__box">
                  <ul  className="tabs-03__buttons_list">
                    <li  className="tab">
                      <button
                         className="tab__button  state-active-tab  js-open-tab"
                         style={{border:"2px solid #10b981"}}
                        type="button"
                        data-index="tab-0"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        Submit
                      </button>
                    </li>
                    <li  className="tab">
                      <button
                         className="tab__button  js-open-tab"
                        type="button"
                        style={{border:"2px solid #10b981"}}
                        data-index="tab-1"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        Review
                      </button>
                    </li>
                    <li  className="tab">
                      <button
                         className="tab__button  js-open-tab"
                        type="button"
                        style={{border:"2px solid #10b981"}}
                        data-index="tab-2"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        Improve
                      </button>
                    </li>
                  </ul>
                  <div  className="tabs-03__item_container">
                    <ul  className="tabs-03__item_list js-tabs-item-list">
                      <li
                         className="tabs-03__item_box js-tab-content state-active-tab  "
                        data-index="tab-0"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        <div
                           className="tabs-03__item js-tab-content-item"
                          data-height=""
                        >
                          <div  className="tabs-03__video-container">
                          <div className="flex-1 text-center mt-7 lg:mt-0 lg:ml-3">
                            <img src={process.env.PUBLIC_URL + "./ux-indonesia-8mikJ83LmSQ-unsplash.jpg"} alt="submit"/>
                          </div>
                          </div>
                          <div  className="tabs-03__text">
                            <h2  className="text-2xl text-green-800 font-bold">Submit Your Article</h2>
                            <div  className="content_box ">
                            We highly encourage you to share your research findings with a broader audience. 
                            One of the best platforms for this is SciCommons. 
                            By submitting your work to SciCommons, you can gain valuable feedback and visibility within the scientific community. 
                            It's a great step towards collaborative knowledge and advancement in your field.
                            </div>
                            <div  className="tabs-03__cta" />
                          </div>
                        </div>
                      </li>
                      <li
                         className="tabs-03__item_box js-tab-content "
                        data-index="tab-1"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        <div
                           className="tabs-03__item js-tab-content-item"
                          data-height=""
                        >
                          <div  className="tabs-03__video-container">
                          <div className="flex-1 text-center mt-7 lg:mt-0 lg:ml-3">
                            <img src={process.env.PUBLIC_URL + "./kaleidico-3V8xo5Gbusk-unsplash.jpg"} alt="review"/>
                          </div>
                          </div>
                          <div  className="tabs-03__text">
                            <h2  className="text-2xl text-green-800 font-bold">Get It Reviewed</h2>
                            <div  className="content_box ">
                            It's imperative to ensure the credibility and quality of your research work. 
                            One of the most effective ways to achieve this is by getting it reviewed by fellow users or peers in the field. 
                            These users, equipped with their expertise and experience, can offer constructive feedback, highlight potential areas of improvement, and validate the significance of your findings. 
                            Such a peer-review process not only enhances the reliability of your research but also fosters a collaborative environment for academic and professional growth. 
                            Engaging with your peers and incorporating their insights can significantly elevate the impact and acceptance of your work within the community.
                            </div>
                            <div  className="tabs-03__cta" />
                          </div>
                        </div>
                      </li>
                      <li
                         className="tabs-03__item_box js-tab-content "
                        data-index="tab-2"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        <div
                           className="tabs-03__item js-tab-content-item"
                          data-height=""
                        >
                          <div  className="tabs-03__video-container">
                          <div className="flex-1 text-center mt-7 lg:mt-0 lg:ml-3">
                            <img className="h-[600px]" src={process.env.PUBLIC_URL + "./alessandro-bianchi-_kdTyfnUFAc-unsplash.jpg"} alt="improve"/>
                          </div>
                          </div>
                          <div  className="tabs-03__text">
                            <h2  className="text-2xl text-green-800 font-bold">Improve Your Article</h2>
                            <div  className="content_box ">
                            Enhancing the quality of your article is paramount to effectively convey your message and engage readers. 
                            Start by revisiting the structure, ensuring a logical flow of ideas that's easy to follow. Ensure that your arguments are supported with robust evidence and data. 
                            Employ a clear and concise writing style, eliminating any redundant or repetitive content. 
                            Paying close attention to grammar and punctuation is crucial for maintaining professionalism. 
                            Lastly, seek feedback from peers or experts in the field; their insights can offer invaluable perspectives to elevate your content further. 
                            Remember, a well-crafted article not only informs but also inspires its readers.
                            </div>
                            <div  className="tabs-03__cta" />
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
           className="page-component__bg_image_box    bg-green-100  "
          id="links-06-607481"
        >
          <div  className="page-component__bg_overlay_box " />
          <div
             className="page-component__wrapper"
            style={{ zIndex: 12, paddingTop: 50, paddingBottom: 70 }}
          >
            <div  className="links-06">
              <div  className="container container--small">
                <div  className="title-box title-box--center">
                  <h2  className="heading ">Features</h2>
                  <div  className="title-box__text content_box ">
                    <p>Uniqueness of our platform</p>
                  </div>
                </div>
              </div>
              <div  className="container links-06__container">
                <ul  className="links-06__list links-06__list--bigger">
                  <li  className="links-06__article links-06__article--white-bg bg-white">
                    <div  className="links-06__logo">
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle
                            fill="#E9F1FF"
                             className="fill-bg-light"
                            cx={20}
                            cy={20}
                            r={20}
                          />
                          <path
                            fill="#4D61FC"
                             className="fill-main"
                            d="M20 13l7 8.235H13z"
                          />
                          <path
                            stroke="#E9F1FF"
                             className="stroke-light fill-secondary"
                            fill="#00396B"
                            d="M20 17.588L28 27H12z"
                          />
                        </g>
                      </svg>
                    </div>
                    <h3  className="links-06__title">Pseudonymity</h3>
                    <div  className="links-06__text">
                      An innovative open peer review website promoting
                      Pseudonymity for unbiased feedback and evaluation.
                    </div>
                    <div  className="links-06__link link feature__button_box" />
                  </li>
                  <li  className="links-06__article bg-white">
                    <div  className="links-06__logo">
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle
                            fill="#E9F1FF"
                             className="fill-bg-light"
                            cx={20}
                            cy={20}
                            r={20}
                          />
                          <path
                            fill="#4D61FC"
                             className="fill-main"
                            d="M13 13h6v6h-6zM21 13h6v6h-6zM13 21h6v6h-6z"
                          />
                          <path
                            fill="#00396B"
                             className="fill-secondary"
                            d="M21 21h6v6h-6z"
                          />
                        </g>
                      </svg>
                    </div>
                    <h3  className="links-06__title ">
                      Multiple Community Review
                    </h3>
                    <div  className="links-06__text ">
                      An article can be reviewed by multiple communities, each
                      community can have multiple reviewers.
                    </div>
                    <div  className="links-06__link link feature__button_box" />
                  </li>
                </ul>
                <ul  className="links-06__list links-06__list--smaller">
                  <li  className="links-06__article bg-white">
                    <div  className="links-06__logo links-06__logo--smaller">
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle
                            fill="#E9F1FF"
                             className="fill-bg-light"
                            cx={20}
                            cy={20}
                            r={20}
                          />
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
                    </div>
                    <h3  className="links-06__title ">Article Versioning</h3>
                    <div  className="links-06__text ">
                      You can submit multiple versions of an article, each
                      version can be reviewed by multiple communities.
                    </div>
                    <div  className="links-06__link link feature__button_box" />
                  </li>
                  <li  className="links-06__article bg-white ">
                    <div  className="links-06__logo links-06__logo--smaller">
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle
                            fill="#E9F1FF"
                             className="fill-bg-light"
                            cx={20}
                            cy={20}
                            r={20}
                          />
                          <path
                            fill="#4D61FC"
                             className="fill-main"
                            d="M13 15l6 1.92v9.6l-6-1.92z"
                          />
                          <path
                            fill="#00396B"
                             className="fill-secondary"
                            d="M26 15l-6 1.92v9.6l6-1.92z"
                          />
                        </g>
                      </svg>
                    </div>
                    <h3  className="links-06__title ">Double Blind Review</h3>
                    <div  className="links-06__text ">
                      The reviewer and the author are unaware of each other's
                      identity. This is to ensure unbiased review.
                    </div>
                    <div  className="links-06__link link feature__button_box" />
                  </li>
                  <li  className="links-06__article bg-white ">
                    <div  className="links-06__logo links-06__logo--smaller">
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g fill="none" fillRule="evenodd">
                          <circle
                            fill="#E9F1FF"
                             className="fill-bg-light"
                            cx={20}
                            cy={20}
                            r={20}
                          />
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
                    </div>
                    <h3  className="links-06__title ">
                      Random Reviewer Assignment
                    </h3>
                    <div  className="links-06__text ">
                      The reviewer is randomly assigned to an article to ensure
                      unbiased review.
                    </div>
                    <div  className="links-06__link link feature__button_box" />
                  </li>
                  <li  className="links-06__article bg-white ">
                    <div  className="links-06__logo links-06__logo--smaller">
                      <svg
                        width={40}
                        height={40}
                        viewBox="0 0 40 40"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <defs>
                          <path id="a" d="M4 4h6v6H4z" />
                        </defs>
                        <g fill="none" fillRule="evenodd">
                          <circle
                            fill="#E9F1FF"
                             className="fill-bg-light"
                            cx={20}
                            cy={20}
                            r={20}
                          />
                          <path
                            fill="#4D61FC"
                             className="fill-main"
                            d="M21 13h6v6h-6zM13 21h6v6h-6z"
                          />
                          <g transform="translate(13 13)">
                            <use
                              fill="#00396B"
                               className="fill-secondary"
                              xlinkHref="#a"
                            />
                            <path
                              stroke="#E9F1FF"
                               className="stroke-light fill-secondary"
                              d="M3.5 3.5h7v7h-7z"
                            />
                          </g>
                        </g>
                      </svg>
                    </div>
                    <h3  className="links-06__title ">Random Handle Name</h3>
                    <div  className="links-06__text ">
                      Every user is assigned a random handle name for each
                      corresponding article to hide the identity of reviewers.
                    </div>
                    <div  className="links-06__link link feature__button_box" />
                  </li>
                </ul>
                <div  className="bottom_cta" />
              </div>
            </div>
          </div>
        </div>
        <div
           className="page-component__bg_image_box    bg-white "
          id="faq-01-374221"
        >
          <div  className="page-component__bg_overlay_box " />
          <div
             className="page-component__wrapper"
            style={{ zIndex: 11, paddingTop: 50, paddingBottom: 50 }}
          >
            <div  className="faq-01">
              <div  className="container container--small">
                <div  className="title-box title-box--center">
                  <h2  className="heading ">
                    We Have Answered Almost All Your Questions
                  </h2>
                </div>
              </div>
              <div  className="container container--small">
                <ul  className="faq-01__list">
                  <li  className="faq-01__item">
                    <button
                       className="faq-01__question js-open-faq color-main border-2 border-green-500"
                       style={{"border":"2px solid #10b981"}}
                      type="button"
                    >
                      <div  className="faq-01__question_text text-green-500">
                        How are reviewers picked by the system?
                        <div  className="faq-01__arrow_icon">
                          <span  className="icon">
                            <svg
                              width="12px"
                              height="7px"
                              viewBox="0 0 12 7"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                              <g
                                id="styleguide"
                                stroke="none"
                                strokeWidth={1}
                                fill="none"
                                fillRule="evenodd"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <g
                                  id="Unicorn-Styleguide"
                                  transform="translate(-1182.000000, -2712.000000)"
                                  strokeWidth={2}
                                  stroke="#4D61FC"
                                   className="stroke-main"
                                >
                                  <g
                                    id="Messages"
                                    transform="translate(81.000000, 2467.000000)"
                                  >
                                    <g
                                      id="toolstips"
                                      transform="translate(791.000000, 57.000000)"
                                    >
                                      <g
                                        id="Tooltip"
                                        transform="translate(1.000000, 98.000000)"
                                      >
                                        <polyline
                                          id="Line"
                                          points="310.5 95.5 315 91 319.5 95.5"
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div  className="faq-01__answer js-faq-item">
                        <div  className="content_box">
                          <div  className="faq-01__answer_text">
                          Reviewers are chosen randomly to guarantee impartial assessments. By employing this method, the system aims to prevent any potential biases that could influence the review process. This random selection ensures that each submission receives a fair evaluation, upholding the integrity and credibility of the reviewing mechanism. It's a critical step in maintaining objectivity and trust in the review process.
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li  className="faq-01__item">
                    <button
                       className="faq-01__question js-open-faq color-main border-2 border-green-500"
                       style={{"border":"2px solid #10b981"}}
                      type="button"
                    >
                      <div  className="faq-01__question_text text-green-500">
                        Are users assigned a random handle name for each article?
                        <div  className="faq-01__arrow_icon">
                          <span  className="icon">
                            <svg
                              width="12px"
                              height="7px"
                              viewBox="0 0 12 7"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                              <g
                                id="styleguide"
                                stroke="none"
                                strokeWidth={1}
                                fill="none"
                                fillRule="evenodd"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <g
                                  id="Unicorn-Styleguide"
                                  transform="translate(-1182.000000, -2712.000000)"
                                  strokeWidth={2}
                                  stroke="#4D61FC"
                                   className="stroke-main"
                                >
                                  <g
                                    id="Messages"
                                    transform="translate(81.000000, 2467.000000)"
                                  >
                                    <g
                                      id="toolstips"
                                      transform="translate(791.000000, 57.000000)"
                                    >
                                      <g
                                        id="Tooltip"
                                        transform="translate(1.000000, 98.000000)"
                                      >
                                        <polyline
                                          id="Line"
                                          points="310.5 95.5 315 91 319.5 95.5"
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div  className="faq-01__answer js-faq-item">
                        <div  className="content_box">
                          <div  className="faq-01__answer_text">
                          Indeed, users are provided with a random handle name for each article to ensure anonymity. This system promotes unbiased interactions and feedback, as the identity of the contributor remains concealed, allowing the content to be the primary focus.
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li  className="faq-01__item">
                    <button
                       className="faq-01__question js-open-faq color-main border-2 border-green-500"
                       style={{"border":"2px solid #10b981"}}
                      type="button"
                    >
                      <div  className="faq-01__question_text text-green-500">
                      Are users rated based on the reaction scores they receive for a review?
                        <div  className="faq-01__arrow_icon">
                          <span  className="icon">
                            <svg
                              width="12px"
                              height="7px"
                              viewBox="0 0 12 7"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                              <g
                                id="styleguide"
                                stroke="none"
                                strokeWidth={1}
                                fill="none"
                                fillRule="evenodd"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <g
                                  id="Unicorn-Styleguide"
                                  transform="translate(-1182.000000, -2712.000000)"
                                  strokeWidth={2}
                                  stroke="#4D61FC"
                                   className="stroke-main"
                                >
                                  <g
                                    id="Messages"
                                    transform="translate(81.000000, 2467.000000)"
                                  >
                                    <g
                                      id="toolstips"
                                      transform="translate(791.000000, 57.000000)"
                                    >
                                      <g
                                        id="Tooltip"
                                        transform="translate(1.000000, 98.000000)"
                                      >
                                        <polyline
                                          id="Line"
                                          points="310.5 95.5 315 91 319.5 95.5"
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div  className="faq-01__answer js-faq-item">
                        <div  className="content_box">
                          <div  className="faq-01__answer_text">
                          Indeed, users are evaluated based on the reaction scores they garner for their reviews. This scoring system is instrumental in upholding the quality of reviews on our platform. By providing a metric for feedback, we can encourage constructive criticism and ensure that reviewers are motivated to offer insightful and valuable feedback. Such measures are vital to foster a credible and trustworthy review environment.
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li  className="faq-01__item">
                    <button
                       className="faq-01__question js-open-faq color-main border-2 border-green-500"
                       style={{"border":"2px solid #10b981"}}
                      type="button"
                    >
                      <div  className="faq-01__question_text text-green-500">
                      Can I submit more than one review for an article?
                        <div  className="faq-01__arrow_icon">
                          <span  className="icon">
                            <svg
                              width="12px"
                              height="7px"
                              viewBox="0 0 12 7"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                              <g
                                id="styleguide"
                                stroke="none"
                                strokeWidth={1}
                                fill="none"
                                fillRule="evenodd"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <g
                                  id="Unicorn-Styleguide"
                                  transform="translate(-1182.000000, -2712.000000)"
                                  strokeWidth={2}
                                  stroke="#4D61FC"
                                   className="stroke-main"
                                >
                                  <g
                                    id="Messages"
                                    transform="translate(81.000000, 2467.000000)"
                                  >
                                    <g
                                      id="toolstips"
                                      transform="translate(791.000000, 57.000000)"
                                    >
                                      <g
                                        id="Tooltip"
                                        transform="translate(1.000000, 98.000000)"
                                      >
                                        <polyline
                                          id="Line"
                                          points="310.5 95.5 315 91 319.5 95.5"
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div  className="faq-01__answer js-faq-item">
                        <div  className="content_box">
                          <div  className="faq-01__answer_text">
                          No, each user is allowed only one review for an article to ensure diverse feedback. However, if you wish to modify or update your thoughts, you have the flexibility to edit your existing review. This ensures that you can refine your feedback while still adhering to the platform's guidelines.
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                  <li  className="faq-01__item">
                    <button
                       className="faq-01__question js-open-faq color-main border-2 border-green-500"
                       style={{"border":"2px solid #10b981"}}
                      type="button"
                    >
                      <div  className="faq-01__question_text text-green-500">
                      Is the review process still open after the article has been published?
                        <div  className="faq-01__arrow_icon">
                          <span  className="icon">
                            <svg
                              width="12px"
                              height="7px"
                              viewBox="0 0 12 7"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                            >
                              <g
                                id="styleguide"
                                stroke="none"
                                strokeWidth={1}
                                fill="none"
                                fillRule="evenodd"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <g
                                  id="Unicorn-Styleguide"
                                  transform="translate(-1182.000000, -2712.000000)"
                                  strokeWidth={2}
                                  stroke="#4D61FC"
                                   className="stroke-main"
                                >
                                  <g
                                    id="Messages"
                                    transform="translate(81.000000, 2467.000000)"
                                  >
                                    <g
                                      id="toolstips"
                                      transform="translate(791.000000, 57.000000)"
                                    >
                                      <g
                                        id="Tooltip"
                                        transform="translate(1.000000, 98.000000)"
                                      >
                                        <polyline
                                          id="Line"
                                          points="310.5 95.5 315 91 319.5 95.5"
                                        />
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div  className="faq-01__answer js-faq-item">
                        <div  className="content_box">
                          <div  className="faq-01__answer_text">
                          Yes, the review process continues even after the article has been published. By keeping it open, we encourage ongoing dialogue and ensure that authors receive continuous feedback. This approach facilitates iterative improvement and adapts to the evolving perspectives of readers and experts.
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                </ul>
                <div  className="bottom_cta" />
              </div>
            </div>
          </div>
        </div>
      
      <div  className="bg-light_gray-color">
        <footer  className="footer-04 " id="footer">
          <div  className="footer-04__top">
            <div  className="container">
              <div  className="footer-04__top_wrapper ">
                <div  className="footer-04__col">
                  <div  className="footer-04__info content_box">
                    <p>© SciCommons. All rights reserved.</p>
                  </div>
                </div>
                <div  className="footer-04__col">
                  <h3  className="footer-04__title">Company</h3>
                  <ul  className="footer-04__list">
                    <li  className="footer-04__item">
                      <a
                        href="/about"
                        target="_blank"
                         className="footer-04__link"
                      >
                        About Us
                      </a>
                    </li>
                    <li  className="footer-04__item">
                      <a
                        href="/contact"
                        target="_blank"
                         className="footer-04__link"
                      >
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
                <div  className="footer-04__col">
                  <h3  className="footer-04__title">Resources</h3>
                  <ul  className="footer-04__list">
                    <li  className="footer-04__item">
                      <a
                        href="/faq"
                        target="_blank"
                         className="footer-04__link"
                      >
                        FAQ
                      </a>
                    </li>
                    <li  className="footer-04__item">
                      <a
                        href="/blog"
                        target="_blank"
                         className="footer-04__link"
                      >
                        Blog
                      </a>
                    </li>
                  </ul>
                </div>
                <div  className="footer-04__col">
                  <h3  className="footer-04__title">Follow us</h3>
                  <div  className="footer-04__social_box">
                    <div  className="social-buttons  social-buttons--left ">
                      <ul  className="social-buttons__list">
                        <li  className="social-buttons__item">
                          <a
                             className="social-buttons__link social-buttons__link--facebook"
                            href="https://www.facebook.com/SciCommons"
                            target="_blank"
                          >
                            <img
                              loading="lazy"
                               className="social-buttons__icon"
                              alt="facebook icon"
                              src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/color/facebook.svg"
                            />
                          </a>
                        </li>
                        <li  className="social-buttons__item">
                          <a
                             className="social-buttons__link social-buttons__link--twitter"
                            href="https://www.twitter.com/SciCommons"
                            target="_blank"
                          >
                            <img
                              loading="lazy"
                               className="social-buttons__icon"
                              alt="twitter icon"
                              src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/color/x.svg"
                            />
                          </a>
                        </li>
                        <li  className="social-buttons__item">
                          <a
                             className="social-buttons__link social-buttons__link--linkedin"
                            href="https://www.linkedin.com/company/SciCommons"
                            target="_blank"
                          >
                            <img
                              loading="lazy"
                               className="social-buttons__icon"
                              alt="linkedin icon"
                              src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/color/linkedin.svg"
                            />
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div  className="footer-04__bottom">
              <div  className="container">
                <div  className="footer-04__bottom_wrapper footer-04__bottom_wrapper--center">
                  <ul  className="footer-04__bottom_links " />
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <div  className="pswp" tabIndex={-1} role="dialog" aria-hidden="true">
        <div  className="pswp__bg" />
        <div  className="pswp__scroll-wrap">
          <div  className="pswp__container">
            <div  className="pswp__item" />
            <div  className="pswp__item" />
            <div  className="pswp__item" />
          </div>
          <div  className="pswp__ui pswp__ui--hidden">
            <div  className="pswp__top-bar">
              <div  className="pswp__counter" />
              <button
                 className="pswp__button pswp__button--close"
                title="Close (Esc)"
              />
              <button
                 className="pswp__button pswp__button--share"
                title="Share"
              />
              <button
                 className="pswp__button pswp__button--fs"
                title="Toggle fullscreen"
              />
              <button
                 className="pswp__button pswp__button--zoom"
                title="Zoom in/out"
              />
              <div  className="pswp__preloader">
                <div  className="pswp__preloader__icn">
                  <div  className="pswp__preloader__cut">
                    <div  className="pswp__preloader__donut" />
                  </div>
                </div>
              </div>
            </div>
            <div  className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
              <div  className="pswp__share-tooltip" />
            </div>
            <button
               className="pswp__button pswp__button--arrow--left"
              title="Previous (arrow left)"
            />
            <button
               className="pswp__button pswp__button--arrow--right"
              title="Next (arrow right)"
            />
            <div  className="pswp__caption">
              <div  className="pswp__caption__center" />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Home;
