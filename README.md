# Roger-Johnny-Bot

A small bot for Discord, using DiscordJS running on Node.

## Features 

* Fetch latest news from NRK
* Play a guess-the-number game with all users
* Creates an instant URL for Google Maps if you search for a specific named place
* Claim Steam keys from bot (if keys exists)

## Rewards

Some commands yields (positive or negative) points when used. This will be used in combination with `!level` on a later stage.

| Command		| Points |
| ------------- | -----: |
| `!kuk`		| -1	 |
| `!ping`		| 1		 |
| `!disco`		| 2		 |
| `!nrk` 		| 1		 |
| `!maps` 		| 1		 |
| `!claim`		| 3		 |
| `!ng X` 		| 1		 |

## Changelog
### 0.5.8
* D100-roll
	* Adds a reaction (orange diamond-icon: 🔸) to the message that won the roll.
	* Buff: A roll of 95 or above triggers the reaction.

### 0.5.7
* Minor fixes done to main code
* D100-roll silently announced by bot adding a small orange diamond-icon ~~at the end of message that got a point~~ as a new message from the bot.

### 0.5.6
* Introduced D100-roll for 1 point. Roll triggers on all non-command message written. A perfect 100-roll will ~~not~~ be announced, but 1 point will be given.

### 0.5.5
* Introduced Points Rewards for different actions. Testing phase initiated. [See Rewards-table](#rewards) for information about points.
* Fixed properly removal of game-key in array of games from a bundle. This should only occur on successfull `!claim XXXX` usage.

### 0.5.1
* Fixed "wrong number guessed" message edits (should work now)

### 0.5.0
* `!disco` - added RNGeesus to it
* `!kuk` - Removed text-to-speech
* `!nrk` - Yields headline for given district (if any)