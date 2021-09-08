const cron = require('node-cron');
const request = require('request');

const url = 'http://141.164.46.105:3000/upbit/xrp';
const options = {
    uri: url
};

let task = cron.schedule('*/3 * * * * *', () => {
    console.log('\n======================' +
                '\nrunning a task every 3 seconds\n');
    request(options, function(err, res, body) {
        const bodyJSON = JSON.parse(body);
        console.log('\n  terminate get the price of XRP: ' + bodyJSON[0].trade_price);
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