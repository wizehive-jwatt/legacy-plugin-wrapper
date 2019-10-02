const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
    purgecss({
      content: ['./.legacy-output/*.*', './wrapper/**/*.js', './wrapper/**/*.html'],
      whitelistPatterns: [/input-/],
      defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
    })
  ]
}
