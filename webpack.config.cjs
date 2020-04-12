const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');

module.exports = {
  entry: './src/browser-main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [ 
    new HtmlWebpackPlugin({
      title: 'nineteen',
      meta: {
        viewport: 'width=device-width, initial-scale=1, user-scalable=no',
      }
    }),
    new FaviconsWebpackPlugin({
      logo: './nineteen.png', 
      favicons: {
        appName: 'nineteen.',
        appDescription: 'When life hands you data, make art.',
        developerName: 'Michael Townsend',
        developerURL: 'http://www.itsmichael.info'
      }
    }),
    new HtmlWebpackTagsPlugin({
      metas: [{
        attributes: {
          property: 'og:title',
          content: 'nineteen.'
        }
      }, {
        attributes: {
          property: 'og:type',
          content: 'website'
        }
      }, {
        attributes: {
          property: 'og:description',
          content: 'When life hands you data, make art.'
        }
      }, {
        attributes: {
          property: 'og:url',
          content: 'http://nineteen.itsmichael.info'
        }
      }, {
        attributes: {
          property: 'og:image',
          content: 'http://nineteen.itsmichael.info/nineteen-1200.png'
        }
      }]
    })
  ],
  module:{
    rules:[{
      test:/\.css$/,
      use:['style-loader','css-loader']
    }]
  }
};