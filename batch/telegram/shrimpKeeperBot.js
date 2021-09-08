const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const key = require('../../env/key.json');
const chatId = key["telegram chatId"];
const token = key["telegram token"];
const bot = new TelegramBot(token, {polling: true});
const url = 'http://141.164.46.105:3000';

bot.on('message', (msg) => {
    console.log(msg);
    if (msg.text == "/on") {
        const options = {
            uri: url.concat("/batch/on")
        };
        request(options, () => {
            bot.sendMessage(chatId, 'shrimp keeper wakes up..');
        });
    } else if (msg.text == "/off") {
        const options = {
            uri: url.concat("/batch/off")
        };
        request(options, () => {
            bot.sendMessage(chatId, 'shrimp keeper sleeps..');
        });
    } else {
        let res = 'shrimp keeper does not understand: ' + msg.text;
        bot.sendMessage(chatId, res);
    }
});


module.exports = bot;
