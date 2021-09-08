const cron = require('node-cron');
const request = require('request');
const shrimpKeeperBot = require('./telegram/shrimpKeeperBot');
const key = require('../env/key.json');
const chatId = key["telegram chatId"];

const url = 'http://141.164.46.105:3000/upbit';
const options = {
    uri: url
};

let task = cron.schedule('*/5 * * * * *', () => {
    console.log('\n======================\nrunning a task every 3 seconds\n');
    request(options, function(err, res, body) {
        const bodyJSON = JSON.parse(body);
        console.log('\n  terminate get the info: ' + bodyJSON);

        const hh = bodyJSON[0].trade_time_kst.substr(0,2);
        const mm = bodyJSON[0].trade_time_kst.substr(2,2);
        const ss = bodyJSON[0].trade_time_kst.substr(4,2);

        const sendMsg = "종목: " + bodyJSON[0].market + "\n"
                        + "기준 시간(한국 시간): " + hh + "시" + mm + "분" + ss + "초\n"
                        + "현재 가격: " + bodyJSON[0].trade_price + " 원\n"
                        + "변화율\n"
                        + "최근 1분 간: " + "0.00" + " %\n"
                        + "최근 3분 간: " + "0.00" + " %\n"
                        + "최근 5분 간: " + "0.00" + " %\n"
                        + "최근 10분 간: " + "0.00" + " %\n"
                        + "거래량: " + bodyJSON[0].trade_volume + " XRP\n";

        shrimpKeeperBot.sendMessage(chatId, sendMsg);
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