const cron = require('node-cron');
const request = require('request');
const shrimpKeeperBot = require('./telegram/shrimpKeeperBot');

const key = require('../env/key.json');
const chatId = key["telegram chatId"];

const url = 'http://141.164.46.105:3000/upbit';
const options = {
    uri: url
};

let task = cron.schedule('*/3 * * * * *', () => {
    console.log('\n======================\nrunning a task every 3 seconds\n');
    request(options, function(err, res, body) {
        const bodyJSON = JSON.parse(body);
        console.log('\n  terminate get the price of XRP: ' + bodyJSON[0].trade_price);

        shrimpKeeperBot.sendMessage(chatId, 'price of XRP: ' + bodyJSON[0].trade_price);
    });
}, {
    scheduled: false
});

const shrimpKeeperJob = (mode) => {
    if ( mode == 'on' ) {
        task.start();
    } else {
        task.stop();
    }
}

module.exports = shrimpKeeperJob;