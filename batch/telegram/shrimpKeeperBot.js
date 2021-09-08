const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const key = require('../../env/key.json');
const chatId = key["telegram chatId"];
const token = key["telegram token"];
const url = key["server ip address"];
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    console.log(msg);

    if ( msg.text == "/help" ) {
        let res = '/on\n   : To start auto alert. (every minute)\n'
                    + '/off\n   : To stop auto alert.\n'
                    + '/ticker=name\n   : To change an other ticker.\n     But, please enter the NAME \n     OF TICKER carefully.\n';
        bot.sendMessage(chatId, res);
    } else if ( msg.text == "/on" ) {
        const options = {
            uri: url.concat("/batch/on")
        };
        request(options, () => {
            bot.sendMessage(chatId, 'shrimp keeper wakes up..');
        });
    } else if ( msg.text == "/off" ) {
        const options = {
            uri: url.concat("/batch/off")
        };
        request(options, () => {
            bot.sendMessage(chatId, 'shrimp keeper sleeps..');
        });
    } else if ( msg.text.substr(0, 7) == "/ticker" ) {
        let newTicker = msg.text.substr(8, msg.text.length - 8);

        if ( !newTicker ) {
            let res = 'Invalid ticker was entered.\nPlease check ticker.';
            bot.sendMessage(chatId, res);
        } else {
            let oldTicker = key["market ticker"];
            key["market ticker"] = newTicker;
            let marketTicker = newTicker.split("-");
            key.market = marketTicker[0];
            key.ticker = marketTicker[1];

            let res = 'Complete changing ticker\n'
                + '  from: ' + oldTicker + "\n"
                + '  to  : ' + key["market ticker"] + "\n";
            bot.sendMessage(chatId, res);
        }
    } else {
        let res = 'shrimp keeper does not understand: ' + msg.text + '\n'
                    + 'If you want to be explained, enter the \'/help\' command.';

        bot.sendMessage(chatId, res);
    }
});


module.exports = bot;
