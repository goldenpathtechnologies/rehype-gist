/* eslint-env node */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `./src/pages/**/*.{js,ts,jsx,tsx,mdx}`,
    `./src/components/**/*.{js,ts,jsx,tsx,mdx}`,
    `./src/app/**/*.{js,ts,jsx,tsx,mdx}`,
    `./src/mdx-components.tsx`,
  ],
  darkMode: `class`,
  theme: {
    extend: {},
    container: {
      center: true,
    },
    fontFamily: {
      body: [`"Open Sans"`, `Helvetica`, `Arial`, `sans-serif`],
      emoji: [
        `"Twemoji Mozilla"`,
        `"Apple Color Emoji"`,
        `"Segoe UI Emoji"`,
        `"Segoe UI Symbol"`,
        `"Noto Color Emoji"`,
        `"EmojiOne Color"`,
        `"Android Emoji"`,
        `sans-serif`,
      ],
    },
  },
  plugins: [
    // eslint-disable-next-line global-require
    require(`@tailwindcss/typography`),
  ],
};
