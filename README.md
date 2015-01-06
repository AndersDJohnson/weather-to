# WeatherTo


## Requirements

Weather Application
* Front end oriented.
* Create weather site that determines if it is a good day to do things outside for the week.
* Weather underground API is one option for data: http://www.wunderground.com/weather/api/
* Takes in user preferences on conditions and temps they like to do things outside.
* Get some weather api.
* See what days match up to your settings and display accordingly.


## Heroku

https://weather-to.herokuapp.com

### Buildpacks

```sh
heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git
```


## TODO

* Features
 * F/C switch
 * Link locations to Google Maps
 * Add to Google Calendar for category matches
 * Add your own API key
 * Persist categories for locations
    * Local storage
    * Import / export
    * Dropbox
    * Google Drive
 * http://bootstrapvalidator.com/
 * https://github.com/wenzhixin/bootstrap-table

* Development
 * grunt-angular-templates
 * angular-hint
 * https://docs.angularjs.org/guide/production#disabling-debug-data
 * ng-strict-di
 * ng-annotate / ng-min
 * https://github.com/johnpapa/angularjs-styleguide
 * http://briantford.com/blog/huuuuuge-angular-apps
