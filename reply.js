var request = require('request');
var twit = require('twit');
var emoji = require('node-emoji');
var child = require('child_process');
var main = require('./index.js');

/*
var process = {
	env: require('./config.js') 
};
*/

String.prototype.capFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var Twitter = new twit(
{
   consumer_key: process.env.CONSUMER_KEY,
   consumer_secret: process.env.CONSUMER_SECRET,
   access_token: process.env.ACCESS_TOKEN,
   access_token_secret: process.env.ACCESS_TOKEN_SECRET 
});

function track(){
	var stream = Twitter.stream('statuses/filter', {track : '@WeatherEmojiBot'})
	
	stream.on('tweet', function(tweet){
		callThis(tweet);
	});

	stream.on('error', (err) => {
  		console.log('error!', err);
	});
}

function callThis(tweetOld){
		var cities = [
		['San Francisco', '37.8267,-122.4233'],
		['Oakland', '37.804363,-122.271111'],
		['Daly City', '37.687923,-122.470207'],
		['Mountain View', '37.386051,-122.083855'],
		['Palo Alto', '37.468319,-122.143936'],
		['San Jose', '37.279518,-121.867905'],
		['Hayward', '37.668819,-122.080795'],
		['SFO','37.654656,-122.40774980000003'],
		['Berkley','37.8716667,-122.2716667'],
		['Stanford','37.424107,-122.166077'],
		['Millbrae','37.5985468,-122.3871942'],
		['SF Airport','37.654656,-122.40774980000003'],
		['Sunnyvale','37.36883,-122.0363496'],
		['Santa Clara','37.3541079,-121.9552356'],
		['San Mateo','37.5629917,-122.3255254'],
		['Golden Gate','37.8199286,-122.47825510000001'],
		['Sunset','37.746731,-122.486349'],
		['Richmond','37.779673,-122.482907'],
		['Mission','37.759865,-122.414798']
	];

	var check = tweetOld.text;
	var tweet = '';
	var flag = 0;
	for(var i = 0; i < cities.length; ++i){
		if(check.toLowerCase().includes(cities[i][0].toLowerCase())){
			request('https://api.darksky.net/forecast/' + process.env.API_KEY + '/' + cities[i][1] 
			+'?exclude=[minutely,hourly,alerts,flags]',
				function(error, response, body){
				var text = JSON.parse(body);	
				console.log(text);
				
				tweet = '@' + tweetOld.user.screen_name + '\n' 
						+ cities[i][0] + ' ' + emoji.get('mantelpiece_clock') + ' ' + main.UNIXToRead(text.currently.time) + '\n\n' 
						+ main.switching(text) + ' ' + text.currently.icon.capFirstLetter() + '\n'
						+ emoji.get('thermometer') + ' ' + text.currently.temperature + ' ' + String.fromCharCode(176) + 'F\n'
						+ emoji.get('wind_blowing_face') + ' ' + text.currently.windSpeed + ' Miles/hr\n'
						+ emoji.get('telescope') + ' ' + text.currently.visibility + ' Miles\n'
						+ emoji.get('sweat_smile') + ' ' + Math.round(text.currently.humidity * 100) + '% Humid\n';

				let content = {
					status: tweet,
					in_reply_to_status_id: tweetOld.id_str
				}

				Twitter.post('statuses/update', content, function(err,data,response){
					console.log(tweet);
				})
			
			});
			flag = 1;
			break;
		}
	}
	
	if(flag === 0){

		let list = '@' + tweetOld.user.screen_name + '\n' 
					+'I serve Bay Area:' + '\n';
		for(let j = 0; j < 10; j++){
			list = list + cities[j][0] + '\n';
		}

		let notice = {
			status : list,
			in_reply_to_status_id: tweetOld.id_str
		}
	
		Twitter.post('statuses/update', notice, function(err,data,response){
			console.log(list);
		})
	}

}

track();