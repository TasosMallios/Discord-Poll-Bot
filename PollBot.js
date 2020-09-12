require('dotenv').config();
const { Client, MessageEmbed } = require('discord.js'); 
const client = new Client();
const token = '';
client.login(token);

// Shows in console if bot is online and sets custom game activity status

client.on('ready', () =>{

    console.log(`${client.user.tag} is online.`); // writes on console that the bot is online
    client.user.setActivity('!help', {type:'LISTENING'}).catch(console.error); // informs users to type 

})

// Mentions user and replies how to use the poll system

client.on('message', async message => {
    if(message.content == '!help') {
        message.reply('Type !poll "expiration time" (number of the time that the poll is going to be live) s (seconds or "m" for minutes) , then ask a question. \n (e.g. !poll 10s is this a poll?)');
    }
})

// Creates a poll of user's question and shows results of the poll 

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.toLowerCase().startsWith('!poll')) {
        let args = message.content.split(" ");
        let time = args[1];
        let question = args.slice(2).join(" ");
        let regex = new RegExp(/^([0-9]{2}|[0-9]{1})[sSmM]$/);
        if(regex.test(time)) { // time that the poll lasts
            if(time.toLowerCase().endsWith('s')) {
                time = parseInt(time.substring(0, time.indexOf('s')));
                time *= 1000;
            } 
            else if(time.toLowerCase().endsWith('m')) {
                time = parseInt(time.substring(0, time.indexOf('m')));
                time *= 60 * 1000;
            }
            const embed = new MessageEmbed()
                .setTitle(question) // sets users question as the title of the embed message
                .setDescription('React with 👍 or 👎')
                .setTimestamp();
            try {
                const polls = new Map();
                const userVotes = new Map();
                let filter = (reaction, user) => {
                    if(user.bot) return false;
                    if(['👍', '👎'].includes(reaction.emoji.name)) {
                        if(polls.get(reaction.message.id).get(user.id))
                            return false;
                        else {
                            userVotes.set(user.id, reaction.emoji.name);
                            return true;
                        }
                    }
                }
                let msg = await message.channel.send(embed); // embed message
                await msg.react('👍');
                await msg.react('👎');
                polls.set(msg.id, userVotes);
                let reactions = await msg.awaitReactions(filter, { time: time });
                let thumbsUp = reactions.get('👍');
                let thumbsDown = reactions.get('👎');
                let thumbsUpResults = 0, thumbsDownResults = 0;
                if(thumbsUp)
                    thumbsUpResults = thumbsUp.users.cache.filter(u => !u.bot).size;
                if(thumbsDown)
                    thumbsDownResults = thumbsDown.users.cache.filter(u => !u.bot).size;
                const resultsEmbed = new MessageEmbed()
                    .setTitle('Results')
                    .setDescription(`👍 - ${thumbsUpResults} votes\n\n👎 - ${thumbsDownResults} votes\n`);
                await message.channel.send(resultsEmbed);
            }
            catch(err) {
                console.log(err);
            }
        }
    }
});