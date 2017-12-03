// Discord: Roger-Johnny-Bot
// @author: Vegard Smelror Åmdal

// All the commands - wip
var cmds = [
	"help - Lists all commands.",
	"ping - You ping, I pong.",
	"kuk - You are one.",
	"points - Your points.",
	"level - Your level.",
	"stats - Shows your game stats",
	"rg X - Starts the guess-a-number, where X is the maximum number (must be 10 or more).",
	"nrk [X] - Fetches latest NRK items if not X (oslo, troms, nordland) is provided",
	"maps X - Creates Google Maps URL where X is a place.",
	"disco - Because why not?",
	"humble - Lists all Humble Bundles and actions"
];
const cfg = require("./config.json"); 
const parser = require('rss-parser'); // RSS parser
const fs = require("fs"); // FileSystem
const Discord = require('discord.js'); // Discordjs
const client = new Discord.Client();

let points = JSON.parse(fs.readFileSync("stats/points.json", "utf8"));
let counter = JSON.parse(fs.readFileSync("stats/counter.json", "utf8"));
let game_guessStats = JSON.parse(fs.readFileSync("stats/guessingstats.json", "utf8"));
let hb = JSON.parse(fs.readFileSync("steamkeys/steamkeys.json", "utf8"));

// Games
let game_guess = { isGameOn: false, numberToGuess: 0, pointsToWin: 0 }

// READY SET 
client.on('ready', () => {
   console.log('Version: 0.4.6 - Connected');
   //console.log('message.channel: '+message.channel);   
   const channel = client.channels.get(cfg.channelid);
   //channel.send('*Roger-Johnny reporting for duty!*');
});


// Welcome message!
client.on("guildMemberAdd", member => {
	console.log("New visitor!");
	const channel = client.channels.get(cfg.channelid);
	channel.send(`${member} is here. Cool.`);
});


// CMD INTERACTION
client.on('message', message => {
	if (!message.content.startsWith('!')) return; // No prefix

	const channel = client.channels.get(cfg.channelid);

	// Initialize points if no present
	if (!points[message.author.id]) points[message.author.id] = {
    		points: 0,
    		level: 1
  		};

  	// Initialize Guessing Game Stats for players
  	if (!game_guessStats[message.author.id]) game_guessStats[message.author.id] = { won: 0, guesses: 0 };
  	let gstats = game_guessStats[message.author.id];

  	// Commands
	if (message.content.toLowerCase() === '!help') {
		let msg = "**Commands:**```css";
		for (var i = 0; i < cmds.length; i++) {
			msg += cmds[i];
			msg += '\n';
		};
		msg += "```";
		msg += "\nPrefix command with **` ! `** if you want me to read it.";
		channel.send(msg);
	}
	else if (message.content.toLowerCase() === '!ping') {
		channel.send('**Pong!** (Ponged counter: '+counter.pong+')');
		counter.pong++;
	}
	else if (message.content.toLowerCase() === '!kuk') {
		// message.reply(':regional_indicator_k::regional_indicator_u::regional_indicator_k:.');
		if(counter.kukauthor !== message.author.username) {
			message.reply(" kuk.", {tts:true});
			counter.kuk++;
			counter.kukauthor = message.author.username;
			message.delete(100);
		}
	}
	else if (message.content.toLowerCase() === '!level') {
		message.reply('your level is '+points[message.author.id].level);
	}
	else if (message.content.toLowerCase() === '!points') {
		message.reply('you have **'+points[message.author.id].points+'** points.');
	}
	else if (message.content.toLowerCase() === '!stats') {
		channel.send(message.author.username+' has '+gstats.won+' wins with '+gstats.guesses+' guesses ('+(gstats.guesses/gstats.won)+' guess/win)');
	}
	else if (message.content.toLowerCase() === '!magic') {
		let msg = "https://media.giphy.com/media/5ftsmLIqktHQA/giphy.gif";
		msg += "\n Ah ah ah! You didn't say the magic word.";
		channel.send(msg);
	}
	else if (message.content.toLowerCase() === '!disco') {
		channel.send(':beers: :tropical_drink: **P A R T Y** :man_dancing: :cartwheel: ');
		message.delete(250).then(msg => console.log(`Deleted message from ${msg.author.username}: ${msg.content}`)).catch(console.error);
	}

	else if (message.content.toLowerCase().startsWith('!nrk')) {
		var url = "https://www.nrk.no/nyheter/siste.rss";
		const args = message.content.split(/\s+/g);
		if(args.length > 1) {
			switch(args[1]) {
				case 'troms':
					url = "https://www.nrk.no/troms/siste.rss";
					break;
				case 'nordland':
					url = "https://www.nrk.no/nordland/siste.rss";
					break;
				case 'oslo':
					url = "https://www.nrk.no/ostlandssendingen/siste.rss"
					break;
				case 'buskerud':
					url = "https://www.nrk.no/buskerud/siste.rss";
					break;
				default:
					url = "https://www.nrk.no/nyheter/siste.rss";
					break;
			}
		}
 		parser.parseURL(url, function(err, parsed) {
 			var news = "";
			for(var c = 0; c < 3; c++) {
				news += '\u2022 ' + parsed.feed.entries[c].title + ' (<' + parsed.feed.entries[c].link + '>) \n'; //channel.send( parsed.feed.entries[c].title + ' (<' + parsed.feed.entries[c].link + '>) \n');
			}
			channel.send( '\u21B4 \n'+news );
		});
 		message.delete(5000);
	}

	// Humble Bundle steam keys
	// Args: 0-1
	else if (message.content.startsWith('!humble')) {
		const args = message.content.split(/\s+/g);
		let msg = "";

		// Top-level command
		// Show bundles with id and amount of games
		if(args.length == 1) {
			msg += "**Bundles:**```";
			msg += " id - name (# games)\n";
			for(let x = 0; x < hb.bundles.length; x++) {
				msg += hb.bundles[x].id + " - "
				msg += hb.bundles[x].name;
				msg += " (" + hb.bundles[x].games.length + ")";
				msg += "\n";
			}
			msg += "```";
			msg += "\nTo show a bundle, use command **`!humble XXX`** where `XXX` is the bundle id.";
		}
		// Specific 
		else if (args.length == 2) {
			let bid = args[1];

			// Loop to find bundle
			for(let x = 0; x < hb.bundles.length; x++) {
				if(hb.bundles[x].id == bid) {
					// Loop to list games
					msg += "**"+hb.bundles[x].id+" - "+hb.bundles[x].name+"**\n```"
					msg += " id  - Game \n";
					for(let y = 0; y < hb.bundles[x].games.length; y++) {
						if(hb.bundles[x].games[y].key != null) {
							msg += hb.bundles[x].games[y].key.substring(0, 4) + " - ";
							msg += hb.bundles[x].games[y].name;
							msg += "\n";
						}
					}
					msg += "```\n";
					msg += "To claim a game, use `!claim ABCD` where `ABCD` is the 4-digit id.";
				}
				if(hb.bundles[x].id != bid && x == hb.bundles.length) {
					msg += "Bundle with id *"+bid+"* was not found.";
				}
			}

		}

		// Finally, send message
		channel.send(msg);
	}

	// Gmaps
	// https://www.google.com/maps/place/<args>
	else if (message.content.startsWith('!maps')) {
		const args = message.content.split(/\s+/g);
		if(args.length < 2) return;

		channel.send('https://www.google.com/maps/place/'+args[1]);
	}

	// Humble Bundle claim game
	else if (message.content.startsWith('!claim')) {
		const args = message.content.split(/\s+/g);
		if(args.length < 2) return;

		let dm = ""; // Direct message to send to author
		// Search for game (needle-haystack)
		for(let x = 0; x < hb.bundles.length; x++) {
			for(let y = 0; y < hb.bundles[x].games.length; y++) {
				if(hb.bundles[x].games[y].key != null && hb.bundles[x].games[y].key.substring(0,4) === args[1]) {
					// Key found
					dm += "\nThis is an automated message.\n\n";
					dm += "Game: "+hb.bundles[x].games[y].name+"\n";
					dm += "Steam-key: `"+hb.bundles[x].games[y].key+"`\n\n";
					message.author.send(dm); // Send message
					let logmsg = hb.bundles[x].games[y].name+" has been claimed by "+message.author.username+".";
					channel.send(logmsg);
					delete hb.bundles[x].games[y]; // Delete key from memory
  					fs.writeFile("steamkeys/steamkeys.json", JSON.stringify(hb), (err) => { if (err) console.error(err) }); // Save steamkeys.json
  					fs.appendFile("steamkeys/steamkeys_log.txt", logmsg, function (err) {
  						if (err) throw err;
  						console.log('Steam key logged');
					});
				}
			}
		}
	}


	// Random number game!
	// Args: 1 (max number)
	else if (message.content.startsWith('!rg') && !game_guess.isGameOn) {
		const args = message.content.split(/\s+/g);
		let maxn = parseInt(args[1]);
		if(!Number.isInteger(maxn)) return;
		if(maxn < 10) { message.reply('the number must be 10 or higher.'); return; }
		if(maxn > 100) { message.reply('the number must be 100 or lower.'); return; }

		// Ready!
		game_guess.pointsToWin = Math.floor(Math.random() * (10 - 1)) + 1;
		channel.send('Guess the correct number, win '+game_guess.pointsToWin+' points. It is a number from 1 to '+maxn);
		channel.send('Use `!n` followed by the number to make a guess (example: `!n 4`)');
		
		// Generate the number
		game_guess.numberToGuess = Math.floor(Math.random() * (maxn - 1)) + 1;
		game_guess.isGameOn = true;
		client.user.setGame('Guessing Game');
	}
	else if (message.content.toLowerCase().startsWith('!n') && game_guess.isGameOn) {
		const args = message.content.split(/\s+/g);
		if(!Number.isInteger(parseInt(args[1]))) {
			message.reply('that is not a number.');
			return;
		}
		let guessed = parseInt(args[1]);
		game_guessStats[message.author.id].guesses++;

		if(guessed === game_guess.numberToGuess) {
			channel.send(message.author.username+' is correct! The number was __'+game_guess.numberToGuess+'__. '+message.author.username+' earns '+game_guess.pointsToWin+' points.');
			points[message.author.id].points += game_guess.pointsToWin;
			game_guessStats[message.author.id].won++;
			game_guess.numberToGuess = null;
			game_guess.isGameOn = false;
			game_guess.pointsToWin = 0;
			client.user.setGame('');
		} else {
			channel.send('Incorrect.');
		}
	}

	saveFiles(); // Last call!
});

// Finally, engage!
client.login(cfg.token);


function saveFiles() {
  	// Save points.json
  	fs.writeFile("stats/points.json", JSON.stringify(points), (err) => { if (err) console.error(err) });
  	// Save counter.json
  	fs.writeFile("stats/counter.json", JSON.stringify(counter), (err) => { if (err) console.error(err) });
	// Save guessingstats.json
  	fs.writeFile("stats/guessingstats.json", JSON.stringify(game_guessStats), (err) => { if (err) console.error(err) });
}
