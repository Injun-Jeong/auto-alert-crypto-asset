const TelegramBot = require('node-telegram-bot-api');
const key = require('../../env/key.json');
const chatId = key["telegram chatId"];
const token = key["telegram token"];
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    console.log(msg);
    bot.sendMessage(chatId, 'recv msg');
});


module.exports = bot;
