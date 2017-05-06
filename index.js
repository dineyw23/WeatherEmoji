var request = require('request');
var twit = require('twit');
var emoji = require('node-emoji');
var child = require('child_process');

/*
var process = {
	env: require('./config.js') 
};
*/

var Twitter = new twit(
{
   consumer_key: process.env.CONSUMER_KEY,
   consumer_secret: process.env.CONSUMER_SECRET,
   access_token: process.env.ACCESS_TOKEN,
   access_token_secret: process.env.ACCESS_TOKEN_SECRET 
});

String.prototype.capFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function start(){
	var cities = [
		['San Francisco', '37.8267,-122.4233'],
		['Oakland', '37.804363,-122.271111'],
		['Daly City', '37.687923,-122.470207'],
		['Mountain View', '37.386051, -122.083855'],
		['Palo Alto', '37.468319, -122.143936'],
		['San Jose', '37.279518,-121.867905'],
		['Hayward', '37.668819, -122.080795'],
		['SF Airport','37.654656,-122.40774980000003'],
		['Berkley','37.8716667,-122.2716667']
	];
	run(cities);
}
//Take care of concatenation later
function run(cities){
	var tweet = '';
	for(var i = 0; i < cities.length; ++i){
		request('https://api.darksky.net/forecast/' + process.env.API_KEY + '/' + cities[i][1] 
			+'?exclude=[minutely,hourly,alerts,flags]',
		function(error, response, body){
			var text = JSON.parse(body);	
			console.log(text);
			
			tweet = cities[i][0] + ' ' + emoji.get('mantelpiece_clock') + ' ' + UNIXToRead(text.currently.time) + '\n\n' 
					+ switching(text) + ' ' + text.currently.icon.capFirstLetter() + '\n'
					+ emoji.get('thermometer') + ' ' + text.currently.temperature + ' ' + String.fromCharCode(176) + 'F\n'
					+ emoji.get('wind_blowing_face') + ' ' + text.currently.windSpeed + ' Miles/hr\n'
					+ emoji.get('telescope') + ' ' + text.currently.visibility + ' Miles\n'
					+ emoji.get('sweat_smile') + ' ' + Math.round(text.currently.humidity * 100) + '% Humid\n';

			var content = {
				status: tweet
			}
			Twitter.post('statuses/update',content, function(err,data,response){
				console.log(data);
			})
		});
	}
}

function UNIXToRead(unix){
	var date = new Date(unix*1000 - (25200000));
	var minutes = "0" + date.getMinutes();
	var formattedTime = date.getHours() + ':' + minutes.substr(-2);
	return formattedTime;
}

function switching(text){
	var icon = '';
	switch(text.currently.icon){
		case 'partly-cloudy-night':
			icon = emoji.get('cloud');
			break;
		case 'clear-day':
			icon = emoji.get('sunny');
			break;
		case 'clear-night':
			icon = emoji.get('crescent_moon');
			break;
		case 'rain':
			icon = emoji.get('rain_cloud');
			break;
		case 'snow':
			icon = emoji.get('snowflake');
			break;
		case 'sleet':
			icon = emoji.get('snow_cloud');
			break;
		case 'wind':
			icon = emoji.get('wind_blowing_face');
			break;
		case 'fog':
			icon = emoji.get('fog');
			break;
		case 'cloudy':
			icon = emoji.get('cloud');
			break;
		case 'partly-cloudy-day':
			icon = emoji.get('sun_behind_cloud');
			break;
		default: 
			icon = emoji.get('sunny');
			break;
	}

	return icon;
}

exports.switching = switching;
exports.UNIXToRead = UNIXToRead;

function Track() {
	var worker2 = child.fork('reply.js');
		worker2.on('close', function (code) {
  		console.log('Child process exited with code ' + code);
	});		
}

Track();
setInterval(start, 24 * 60 * 60 * 1000);
