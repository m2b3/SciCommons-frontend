import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config : DocsThemeConfig = {
  logo: <span>SciCommons Docs</span>,
  project: {
    link: "https://github.com/dinakar17",
  },
  chat: {
    link: "https://discord.com",
  },
  docsRepositoryBase: "https://github.com/dinakar17/scicommons-docs",
  footer: {
    text: "SciCommons documentation",
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s - SciCommons Docs",
      description: "SciCommons documentation",
      openGraph: {
        type: "website",
        url: "https://scicommons.org",
        title: "SciCommons Docs",
        description: "SciCommons documentation",
        images: [
          {
            url: "https://via.placeholder.com/800x600.png?text=SciCommons+Docs",
            width: 800,
            height: 600,
            alt: "SciCommons Docs",
          },
        ],
      },
    };
  },
};

export default config;