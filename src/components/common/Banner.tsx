import React from 'react';

const Banner = () => {
  return (
    <>
      {/* Fixed by Codex on 2026-02-15
          Who: Codex
          What: Tokenize banner text color.
          Why: Keep banner copy aligned with skin palettes.
          How: Use functional yellow contrast token instead of hard-coded yellow. */}
      <div className="flex w-full flex-row items-center justify-center rounded-t-3xl bg-functional-yellow/15 p-4 pb-16 text-center text-functional-yellowContrast">
        <div className="flex flex-col items-start space-y-2">
          <ul className="list-disc space-y-1 pl-5 text-xs md:text-sm">
            <li>
              We are getting closer to release. Set up a community and use it for discussions like
              Neurostars or Discourse.
            </li>
            <li>Set up a journal club for your group: it works !</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Banner;
