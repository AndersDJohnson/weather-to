/* eslint-disable no-console */
/* eslint-env node */

var fs = require('fs');
var mkdirp = require('mkdirp');

var rootDir = __dirname + '/..';
var imgPath = '/';

var favicons = require('favicons'),
  source = rootDir + '/public/img/logo/logo.png',           // Source image(s). `string`, `buffer` or array of `string`
  configuration = {
    appName: 'WeatherTo',                  // Your application's name. `string`
    appDescription: 'Weather activity planning.',           // Your application's description. `string`
    developerName: 'Anders D. Johnson',            // Your (or your developer's) name. `string`
    developerURL: 'https://andrz.me',             // Your (or your developer's) URL. `string`
    background: '#444',             // Background colour for flattened icons. `string`
    path: imgPath,                      // Path for overriding default icons path. `string`
    display: 'standalone',          // Android display: "browser" or "standalone". `string`
    orientation: 'portrait',        // Android orientation: "portrait" or "landscape". `string`
    start_url: '/?homescreen=1',    // Android start application's URL. `string`
    version: '1.0',                 // Your application's version number. `number`
    logging: false,                 // Print logs to console? `boolean`
    online: false,                  // Use RealFaviconGenerator to create favicons? `boolean`
    preferOnline: false,            // Use offline generation, if online generation has failed. `boolean`
    icons: {
      android: true,              // Create Android homescreen icon. `boolean`
      appleIcon: true,            // Create Apple touch icons. `boolean` or `{ offset: offsetInPercentage }`
      appleStartup: true,         // Create Apple startup images. `boolean`
      coast: { offset: 25 },      // Create Opera Coast icon with offset 25%. `boolean` or `{ offset: offsetInPercentage }`
      favicons: true,             // Create regular favicons. `boolean`
      firefox: true,              // Create Firefox OS icons. `boolean` or `{ offset: offsetInPercentage }`
      windows: true,              // Create Windows 8 tile icons. `boolean`
      yandex: true                // Create Yandex browser icon. `boolean`
    }
  },
  callback = function (error, response) {
    if (error) {
      console.log(error.status);  // HTTP error code (e.g. `200`) or `null`
      console.log(error.name);    // Error name e.g. "API Error"
      console.log(error.message); // Error description e.g. "An unknown error has occurred"
      return;
    }
    console.log(response.images);   // Array of { name: string, contents: <buffer> }
    console.log(response.files);    // Array of { name: string, contents: <string> }
    console.log(response.html);     // Array of strings (html elements)

    var outDir = rootDir + '/public' + imgPath;
    mkdirp.sync(outDir);

    response.images.forEach(function (image) {
      fs.writeFileSync(outDir + '/' + image.name, image.contents);
    });

    response.files.forEach(function (file) {
      fs.writeFileSync(rootDir + '/public/' + file.name, file.contents);
    });

    var html = response.html.join('\n');
    fs.writeFileSync(rootDir + '/public/favicons.html', html);
  };

favicons(source, configuration, callback);
