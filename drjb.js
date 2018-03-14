// Discord: Roger-Johnny-Bot
// @author: Vegard Smelror Åmdal
const version = "0.5.7";
const cmds = [
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
const loginmessage = "Beep-boop. Running on "+version+" :check: ";

let points = JSON.parse(fs.readFileSync("stats/points.json", "utf8"));
let counter = JSON.parse(fs.readFileSync("stats/counter.json", "utf8"));
let game_guessStats = JSON.parse(fs.readFileSync("stats/guessingstats.json", "utf8"));
let hb = JSON.parse(fs.readFileSync("steamkeys/steamkeys.json", "utf8"));

// Games
let game_guess = { isGameOn: false, numberToGuess: 0, pointsToWin: 0 }

// READY SET 
client.on('ready', () => {
   console.log('Version: '+version+' - Connected');
   //console.log('message.channel: '+message.channel);   
   const channel = client.channels.get(cfg.channelid);
   channel.send(loginmessage);
});

// Welcome message!
client.on("guildMemberAdd", member => {
	console.log("New visitor!");
	const channel = client.channels.get(cfg.channelid);
	channel.send(`** ${member} ** is here. Cool.`);
});

// CMD INTERACTION
client.on('message', message => {
	// No command prefix, but random roll for points given.
	if (!message.content.startsWith('!')) {
		// RNG for ekstra point (1:100 chance)
		if( (Math.floor(Math.random() * (100 - 1)) + 1) === 100) {
			points[message.author.id].points++;
			let m = message.content;
			m += " :small_orange_diamond: ";
			message.edit(m)
			.then(msg => console.log(msg.author.username + " was awarded point."))
			.catch(console.error);
		}
		return; // We're done here.
	}
	const channel = client.channels.get(cfg.channelid);
	const msgsent = message.content.toLowerCase();
	let pointsReward = 0; // Used for rewarding points by different usage.

	// Initialize points if no present
	if (!points[message.author.id]) points[message.author.id] = {
    		points: 0,
    		level: 1
  		};

  	// Initialize Guessing Game Stats for players
  	if (!game_guessStats[message.author.id]) game_guessStats[message.author.id] = { won: 0, guesses: 0 };
  	let gstats = game_guessStats[message.author.id];

  	// Commands
	if (msgsent === '!help') {
		let msg = "**Commands:**```";
		for (var i = 0; i < cmds.length; i++) {
			msg += cmds[i];
			msg += '\n';
		};
		msg += "```";
		msg += "\nPrefix command with **` ! `** if you want me to read it.";
		channel.send(msg);
	}
	else if (msgsent === '!ping') {
		channel.send('**Pong!** (Ponged counter: '+counter.pong+')');
		counter.pong++;
		pointsReward = 1;
	}
	else if (msgsent === '!kuk') {
		if(counter.kukauthor !== message.author.username) {
			message.reply(" kuk.");
			counter.kuk++;
			counter.kukauthor = message.author.username;
			pointsReward = -1;
			message.delete(100);
		}
	}
	else if (msgsent === '!level') {
		message.reply('your level is '+points[message.author.id].level);
	}
	else if (msgsent === '!points') {
		message.reply('you have **'+points[message.author.id].points+'** points.');
	}
	else if (msgsent === '!stats') {
		channel.send(message.author.username+' has '+gstats.won+' wins with '+gstats.guesses+' guesses ('+(gstats.guesses/gstats.won)+' guess/win)');
	}
	else if (msgsent === '!magic') {
		let msg = "https://media.giphy.com/media/5ftsmLIqktHQA/giphy.gif";
		msg += "\n Ah ah ah! You didn't say the magic word.";
		channel.send(msg);
	}
	else if (msgsent === '!disco') {
		const discos = [
			':beers: :tropical_drink: **P A R T Y** :man_dancing: :cartwheel: ',
			':palm_tree: :cocktail: **P A R T Y** :slot_machine: :lifter: ',
			':handball: :dancer:  **P A R T Y** :beer: :100: '
		];
		let n = Math.floor(Math.random() * (discos.length - 1)) + 1;
		channel.send( discos[n] );
		message.delete(250).then(msg => console.log(`Deleted message from ${msg.author.username}: ${msg.content}`)).catch(console.error);
		pointsReward = 2;
	}

	else if (msgsent.startsWith('!nrk')) {
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
		let headline = (args.length > 1 ? args[1]+" " : " "); // If headline, display headline
 		parser.parseURL(url, function(err, parsed) {
 			var news = "";
			for(var c = 0; c < 3; c++) {
				news += '\u2022 ' + parsed.feed.entries[c].title + ' (<' + parsed.feed.entries[c].link + '>) \n'; //channel.send( parsed.feed.entries[c].title + ' (<' + parsed.feed.entries[c].link + '>) \n');
			}
			channel.send( 'NRK '+headline+'\u21B4 \n'+news );
		});
 		message.delete(250);
 		pointsReward = 1;
	}

	// Humble Bundle steam keys
	// Args: 0-1
	else if (msgsent.startsWith('!humble')) {
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
				msg += " ("+ hb.bundles[x].games.length +")";
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
						if(hb.bundles[x].games[y].key !== null) {
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
	else if (msgsent.startsWith('!maps')) {
		const args = message.content.split(/\s+/g);
		if(args.length < 2) return;
		channel.send('https://www.google.com/maps/place/'+args[1]);
		pointsReward = 1;
	}

	// Humble Bundle claim game
	else if (msgsent.startsWith('!claim')) {
		const args = message.content.split(/\s+/g);
		if(args.length < 2) return;

		let dm = ""; // Direct message to send to author
		// Search for game (needle-haystack)
		for(let x = 0; x < hb.bundles.length; x++) {
			for(let y = 0; y < hb.bundles[x].games.length; y++) {
				if(hb.bundles[x].games[y].key !== null && hb.bundles[x].games[y].key.substring(0,4) === args[1]) {
					// Key found
					dm += "\nThis is an automated message.\n\n";
					dm += "Game: "+hb.bundles[x].games[y].name+"\n";
					dm += "Steam-key: `"+hb.bundles[x].games[y].key+"`\n\n";
					message.author.send(dm); // Send message
					let logmsg = hb.bundles[x].games[y].name+" has been claimed by "+message.author.username+".";
					pointsReward = 3;
					channel.send(logmsg);
					// Remove by Array.splice(index, # of items to remove);
					let removedGame = hb.bundles[x].games.splice(y,1);
  					fs.writeFile("steamkeys/steamkeys.json", JSON.stringify(hb), (err) => { if (err) console.error(err) }); // Save steamkeys.json
  					fs.appendFile("steamkeys/steamkeys_log.txt", logmsg, function (err) {
  						if (err) throw err;
  						console.log('Steam key logged');
					});
					removedGame = null;
				}
			}
		}
	}

	// Random number game!
	// Args: 1 (max number)
	else if (msgsent.startsWith('!rg') && !game_guess.isGameOn) {
		const args = message.content.split(/\s+/g);
		let maxn = parseInt(args[1]);
		if(!Number.isInteger(maxn)) return;
		if(maxn < 10) { message.reply('the number must be 10 or higher.'); return; }
		if(maxn > 100) { message.reply('the number must be 100 or lower.'); return; }

		// Ready!
		game_guess.pointsToWin = Math.floor(Math.random() * (10 - 1)) + 1;
		channel.send('Guess the correct number, win '+game_guess.pointsToWin+' points. It is a number from 1 to '+maxn);
		channel.send('Type `!n` followed by the number to make a guess (example: `!n 4`)');
		
		// Generate the number
		game_guess.numberToGuess = Math.floor(Math.random() * (maxn - 1)) + 1;
		game_guess.isGameOn = true;
		client.user.setGame('Guessing Game');
	}
	else if (msgsent.startsWith('!n') && game_guess.isGameOn) {
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
			const wrongmsg = message.toString()+" :wrong:";
			message.edit( wrongmsg );
			pointsReward = 1; // 1 point reward for participating
		}
	}	
	// Assign any points (if any)
	points[message.author.id].points += pointsReward;
	// Save all files for continuity
	saveFiles();
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
