import React, { useState } from "react";
import "./Home.css";
import {
  HomeCarousalData,
  HomeFeaturesTileData,
  faqs,
} from "../../Utils/Constants/Home";
import FeatureTile from "./Components/FeatureTile";
import FaqAccordian from "./Components/FaqAccordian";
import { Link } from "react-router-dom";

const Home = () => {
  const [idx, setIdx] = useState(0);
  const [displayData, setDisplayData] = useState(HomeCarousalData);
  const show = (i) => {
    let str = ".faq-0" + i;
    str += "__answer";
    const faqAnswer = document.querySelector(str);
    console.log(str);
    if (faqAnswer) {
      const currentDisplay = window
        .getComputedStyle(faqAnswer)
        .getPropertyValue("display");

      if (currentDisplay === "none") {
        faqAnswer.style.display = "block";
      } else {
        faqAnswer.style.display = "none";
      }
    }
  };

  return (
    <>
      <div
        className="custom-google-fonts-enabled comps"
        id="107237-212152"
      >
        <div
          className="page-component__bg_image_box bg-medium-color"
          id="header-23-256551"
        >
          <div className="page-component__bg_overlay_box " />
          <div
            className="page-component__wrapper bg-[#ebfde8]"
            style={{ zIndex: 14, paddingTop: 70, paddingBottom: 70 }}
          >
            <header className="header-23 graphics-image default-graphics-image">
              <div className="container container--large header-23__container">
                <div className="header-23__left">
                  <div
                    className="header-23__left_content"
                    style={{ marginLeft: "50px" }}
                  >
                    <h1 className="heading heading--accent header-23__heading ">
                      Welcome to SciCommons
                    </h1>
                    <div className="header-23__text content_box ">
                      An open peer review platform for efficient and anonymous
                      article reviewal.
                    </div>
                    <div className="header-23__cta_box">
                      <div className="buttons-set">
                        <ul className="buttons-set__list ">
                          <li className="buttons-set__item ">
                            <Link
                              data-stripe-product-id=""
                              data-stripe-mode="payment"
                              data-successful-payment-url=""
                              data-cancel-payment-url=""
                              className="button border-4 border-green-500 text-green-500 font-semibold rounded-md"
                              to={"/register"}
                              style={{ border: "2px solid #10b981" }}
                            >
                              <span className="button__text">Get Started</span>
                            </Link>
                          </li>
                        </ul>
                        <div className="content_box cta_bottom_info ">
                          Join us and make the reviewal process fast and
                          efficient.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="header-23__right" style={{ width: "400px" }}>
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
          <div className="page-component__bg_overlay_box " />
          <div
            className="page-component__wrapper"
            style={{ zIndex: 13, paddingTop: 50, paddingBottom: 50 }}
          >
            <div className="tabs-03 graphics-video default-graphics-image">
              <div className="container container--small">
                <div className="title-box title-box--center">
                  <h2 className="heading ">How It Works</h2>
                  <div className="title-box__text content_box ">
                    Simplified steps to get your article reviewed.
                  </div>
                </div>
              </div>
              <div className="container">
                <div className="tabs-03__box">
                  <ul className="tabs-03__buttons_list">
                    <li className="tab">
                      <button
                        className="tab__button  state-active-tab  js-open-tab"
                        style={{
                          border: "2px solid #10b981",
                          backgroundColor: idx === 0 ? "green" : "white",
                          color: idx === 0 ? "white" : "green",
                        }}
                        type="button"
                        data-index="tab-0"
                        data-group="my-images-group-tabs-03-581951"
                        onClick={() => {
                          setIdx(0);
                        }}
                      >
                        Submit
                      </button>
                    </li>
                    <li className="tab">
                      <button
                        className="tab__button  js-open-tab"
                        type="button"
                        style={{
                          border: "2px solid #10b981",
                          backgroundColor: idx === 1 ? "green" : "white",
                          color: idx === 1 ? "white" : "green",
                        }}
                        data-index="tab-1"
                        data-group="my-images-group-tabs-03-581951"
                        onClick={() => {
                          setIdx(1);
                        }}
                      >
                        Review
                      </button>
                    </li>
                    <li className="tab">
                      <button
                        className="tab__button  js-open-tab"
                        type="button"
                        style={{
                          border: "2px solid #10b981",
                          backgroundColor: idx === 2 ? "green" : "white",
                          color: idx === 2 ? "white" : "green",
                        }}
                        data-index="tab-2"
                        data-group="my-images-group-tabs-03-581951"
                        onClick={() => {
                          setIdx(2);
                        }}
                      >
                        Improve
                      </button>
                    </li>
                  </ul>
                  <div className="tabs-03__item_container">
                    <ul className="tabs-03__item_list js-tabs-item-list">
                      <li
                        className="tabs-03__item_box js-tab-content state-active-tab  "
                        data-index="tab-0"
                        data-group="my-images-group-tabs-03-581951"
                      >
                        <div
                          className="tabs-03__item js-tab-content-item"
                          data-height=""
                        >
                          <div className="tabs-03__video-container">
                            <div className="flex-1 text-center mt-7 lg:mt-0 lg:ml-3">
                              <img
                                src={`${process.env.PUBLIC_URL}/${displayData[idx].image}`}
                                style={{ width: "50rem", height: "25rem" }}
                                alt="submit"
                              />
                            </div>
                          </div>
                          <div className="tabs-03__text">
                            <h2 className="text-2xl text-green-800 font-bold">
                              {displayData[idx].title}
                            </h2>
                            <div className="content_box ">
                              {displayData[idx].description}
                            </div>
                            <div className="tabs-03__cta" />
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
          <div className="page-component__bg_overlay_box " />
          <div
            className="page-component__wrapper"
            style={{ zIndex: 12, paddingTop: 50, paddingBottom: 70 }}
          >
            <div className="links-06">
              <div className="container container--small">
                <div className="title-box title-box--center">
                  <h2 className="heading ">Features</h2>
                  <div className="title-box__text content_box ">
                    <p>Uniqueness of our platform</p>
                  </div>
                </div>
              </div>
              <div className="container links-06__container">
                <ul className="links-06__list links-06__list--bigger">
                  {HomeFeaturesTileData.map((item, index) => {
                    return <FeatureTile item={item} key={index} />;
                  })}
                </ul>
                <div className="bottom_cta" />
              </div>
            </div>
          </div>
        </div>
        <div
          className="page-component__bg_image_box    bg-white "
          id="faq-01-374221"
        >
          <div className="page-component__bg_overlay_box " />
          <div
            className="page-component__wrapper"
            style={{ zIndex: 11, paddingTop: 50, paddingBottom: 50 }}
          >
            <div className="faq-01">
              <div className="container container--small">
                <div className="title-box title-box--center">
                  <h2 className="heading ">
                    We Have Answered Almost All Your Questions
                  </h2>
                </div>
              </div>
              <div className="container container--small">
                {faqs.map((faq, index) => {
                  return <FaqAccordian faq={faq} index={index} key= {index}/>;
                })}
                <div className="bottom_cta" />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-light_gray-color">
          <footer className="footer-04 " id="footer">
            <div className="footer-04__top">
              <div className="container">
                <div className="footer-04__top_wrapper ">
                  <div className="footer-04__col">
                    <div className="footer-04__info content_box">
                      <p>© SciCommons. All rights reserved.</p>
                    </div>
                  </div>
                  <div className="footer-04__col">
                    <h3 className="footer-04__title">Company</h3>
                    <ul className="footer-04__list">
                      <li className="footer-04__item">
                        <a
                          href="/about"
                          target="_blank"
                          className="footer-04__link"
                        >
                          About Us
                        </a>
                      </li>
                      <li className="footer-04__item">
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
                  <div className="footer-04__col">
                    <h3 className="footer-04__title">Resources</h3>
                    <ul className="footer-04__list">
                      <li className="footer-04__item">
                        <a
                          href="/faq"
                          target="_blank"
                          className="footer-04__link"
                        >
                          FAQ
                        </a>
                      </li>
                      <li className="footer-04__item">
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
                  <div className="footer-04__col">
                    <h3 className="footer-04__title">Follow us</h3>
                    <div className="footer-04__social_box">
                      <div className="social-buttons  social-buttons--left ">
                        <ul className="social-buttons__list">
                          <li className="social-buttons__item">
                            <a
                              className="social-buttons__link social-buttons__link--facebook"
                              href="https://www.facebook.com/SciCommons"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                loading="lazy"
                                className="social-buttons__icon"
                                alt="facebook icon"
                                src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/color/facebook.svg"
                              />
                            </a>
                          </li>
                          <li className="social-buttons__item">
                            <a
                              className="social-buttons__link social-buttons__link--twitter"
                              href="https://www.twitter.com/SciCommons"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                loading="lazy"
                                className="social-buttons__icon"
                                alt="twitter icon"
                                src="https://dvzvtsvyecfyp.cloudfront.net/static/img/icons/social/color/x.svg"
                              />
                            </a>
                          </li>
                          <li className="social-buttons__item">
                            <a
                              className="social-buttons__link social-buttons__link--linkedin"
                              href="https://www.linkedin.com/company/SciCommons"
                              target="_blank"
                              rel="noreferrer"
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
              <div className="footer-04__bottom">
                <div className="container">
                  <div className="footer-04__bottom_wrapper footer-04__bottom_wrapper--center">
                    <ul className="footer-04__bottom_links " />
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <div className="pswp" tabIndex={-1} role="dialog" aria-hidden="true">
          <div className="pswp__bg" />
          <div className="pswp__scroll-wrap">
            <div className="pswp__container">
              <div className="pswp__item" />
              <div className="pswp__item" />
              <div className="pswp__item" />
            </div>
            <div className="pswp__ui pswp__ui--hidden">
              <div className="pswp__top-bar">
                <div className="pswp__counter" />
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
                <div className="pswp__preloader">
                  <div className="pswp__preloader__icn">
                    <div className="pswp__preloader__cut">
                      <div className="pswp__preloader__donut" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div className="pswp__share-tooltip" />
              </div>
              <button
                className="pswp__button pswp__button--arrow--left"
                title="Previous (arrow left)"
              />
              <button
                className="pswp__button pswp__button--arrow--right"
                title="Next (arrow right)"
              />
              <div className="pswp__caption">
                <div className="pswp__caption__center" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
