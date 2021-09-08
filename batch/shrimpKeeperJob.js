const cron = require('node-cron');
const request = require('request');
const shrimpKeeperBot = require('./telegram/shrimpKeeperBot');
const key = require('../env/key.json');
const chatId = key["telegram chatId"];
const serverAddress = key["server ip address"];

const url = serverAddress.concat('/upbit');
const options = {
    uri: url
};


/* db라고 이름 붙이기 민망할 정도,,, */
let db = [];
let change_price_rate_a_minute = 0.00;
let change_price_rate_three_minute = 0.00;
let change_price_rate_five_minute = 0.00;
let change_price_rate_seven_minute = 0.00;
let change_price_rate_ten_minute = 0.00;
let cntTicker = "";


let task = cron.schedule('*/5 * * * * *', () => {
    console.log('\n======================\nrunning a task every 3 seconds\n');
    request(options, async function(err, res, body) {
        const bodyJSON = JSON.parse(body);
        console.log('\n  terminate get the info: ' + bodyJSON);

        const hh = bodyJSON[0].trade_time_kst.substr(0,2);
        const mm = bodyJSON[0].trade_time_kst.substr(2,2);
        const ss = bodyJSON[0].trade_time_kst.substr(4,2);

        /* update db and rate */
        await calcRate(bodyJSON[0].trade_price);

        const sendMsg = "종목: " + bodyJSON[0].market + "\n"
                        + "기준 시간(한국 시간): " + hh + "시 " + mm + "분 " + ss + "초\n\n"
                        + "현재 가격: " + bodyJSON[0].trade_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
                        + "전일대비 : " + (bodyJSON[0].signed_change_rate * 100).toFixed(2).toString() + " %\n"
                        + "전일 종가: " + bodyJSON[0].opening_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
                        + "금일 고가: " + bodyJSON[0].high_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
                        + "금일 저가: " + bodyJSON[0].low_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"

                        + "\n단기 변화율\n"
                        + "최근  1분 간: " + change_price_rate_a_minute.toFixed(2).toString() + " %\n"
                        + "최근  3분 간: " + change_price_rate_three_minute.toFixed(2).toString() + " %\n"
                        + "최근  5분 간: " + change_price_rate_five_minute.toFixed(2).toString() + " %\n"
                        + "최근  7분 간: " + change_price_rate_seven_minute.toFixed(2).toString() + " %\n"
                        + "최근 10분 간: " + change_price_rate_ten_minute.toFixed(2).toString() + " %\n\n"

                        + "거래량: " + bodyJSON[0].trade_volume + " " + key.ticker + "\n";
        console.log(sendMsg);


        shrimpKeeperBot.sendMessage(chatId, sendMsg);
    });
}, {
    scheduled: false
});


const calcRate = async function( trade_price ) {
    if ( !cntTicker ) {
        cntTicker = key["market ticker"];
    } else if ( cntTicker != key["market ticker"] ) {
        cntTicker = key["market ticker"];
        db = [];
    }

    /* update db */
    db[10] = db[9];
    db[9] = db[8];
    db[8] = db[7];
    db[7] = db[6];
    db[6] = db[5];
    db[5] = db[4];
    db[4] = db[3];
    db[3] = db[2];
    db[2] = db[1];
    db[1] = db[0];
    db[0] = trade_price;


    /* calculate change rate */
    change_price_rate_a_minute = 0;
    change_price_rate_three_minute = 0;
    change_price_rate_five_minute = 0;
    change_price_rate_seven_minute = 0;
    change_price_rate_ten_minute = 0;


    if ( !Number.isNaN(db[1]) ) {
        let val = db[0] - db[1];
        change_price_rate_a_minute = val == 0 ? 0.00 : (val / db[1]) * 100;
    }

    if ( !Number.isNaN(db[3]) ) {
        let val = db[0] - db[3];
        change_price_rate_three_minute = val == 0 ? 0.00 : (val / db[3]) * 100;
    }

    if ( !Number.isNaN(db[5]) ) {
        let val = db[0] - db[5];
        change_price_rate_five_minute = val == 0 ? 0.00 : (val / db[5]) * 100;
    }

    if ( !Number.isNaN(db[7]) ) {
        let val = db[0] - db[7];
        change_price_rate_seven_minute = val == 0 ? 0.00 : (val / db[7]) * 100;
    }

    if ( !Number.isNaN(db[10]) ) {
        let val = db[0] - db[10];
        change_price_rate_ten_minute = val == 0 ? 0.00 : (val / db[10]) * 100;
    }
}


const shrimpKeeperJob = (mode) => {
    if ( mode == 'on' ) {
        task.start();
    } else {
        task.stop();
    }
}


module.exports = shrimpKeeperJob;