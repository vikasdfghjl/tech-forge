import postcss from 'postcss';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  // Add explicit parsing options to prevent the "from" warning
  parser: {
    parse: (css, opts) => {
      opts.from = opts.from || 'default.css';
      return postcss.parse(css, opts);
    }
  }
}
