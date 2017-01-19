/* globals App */
/* eslint-disable quote-props */

App.info({
  name: 'Prospects',
  description: 'Simple app to collect prospective customers.',
  author: 'chris saunders',
  email: 'chriss@computech-it.co.uk',
  website: 'http://computech-it.co.uk',
  version: '0.1.0',
});

App.icons({
  // iOS
  'iphone_2x': 'resources/icons/64x64.png',
  'ipad': 'resources/icons/76x76.png',
  'ipad_2x': 'resources/icons/76x76.png',

  // Android
  'android_ldpi': 'resources/icons/36x36.png',
  'android_mdpi': 'resources/icons/48x48.png',
  'android_hdpi': 'resources/icons/72x72.png',
  'android_xhdpi': 'resources/icons/96x96.png',
});

App.launchScreens({
  // iOS
  'iphone_2x': 'resources/splash/320x480.png',
  'iphone5': 'resources/splash/320x568.png',
  'ipad_portrait': 'resources/splash/768x1024.png',
  'ipad_portrait_2x': 'resources/splash/768x1024.png',
  'ipad_landscape': 'resources/splash/1024x768.png',
  'ipad_landscape_2x': 'resources/splash/1024x768.png',

  // Android
  'android_mdpi_portrait': 'resources/splash/320x480.png',
  'android_mdpi_landscape': 'resources/splash/480x320.png',
  'android_hdpi_portrait': 'resources/splash/480x800.png',
  'android_hdpi_landscape': 'resources/splash/800x480.png',
  'android_xhdpi_portrait': 'resources/splash/720x1280.png',
  'android_xhdpi_landscape': 'resources/splash/1280x720.png',
});

App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');