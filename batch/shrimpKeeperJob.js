const cron = require('node-cron');
const request = require('request');
const shrimpKeeperBot = require('./telegram/shrimpKeeperBot');
const key = require('../env/key.json');
const chatId = key["telegram chatId"];
const serverAddress = key["server ip address"];

let cntTicker = "";

/* db라고 이름 붙이기 민망할 정도,,, */
let db = [];

/* 단기 변화율 */
let change_price_rate_a_minute = 0.00;
let change_price_rate_three_minute = 0.00;
let change_price_rate_five_minute = 0.00;
let change_price_rate_seven_minute = 0.00;
let change_price_rate_ten_minute = 0.00;

/* 단기 평균 금액 */
let avg_price_a_minute = 0;
let avg_price_three_minute = 0;
let avg_price_five_minute = 0;
let avg_price_seven_minute = 0;
let avg_price_ten_minute = 0;

let last_acc_trade_volume = 0;

//todo
const callLighthouse = function(bodyJSONString) {
    const bodyJSON = JSON.parse(bodyJSONString);

    const url = serverAddress.concat(':7777/lighthouse');
    const options = {
        uri: url,
        method: 'POST',
        body: bodyJSON,
        json: true
    };

    request(options, function(err, res, body) {
        console.log(err);
    });
}


let task = cron.schedule('*/1 * * * *', () => {
    const url = serverAddress.concat(':3000/upbit');
    const options = {
        uri: url
    };

    request(options, async function(err, res, body) {
        /* 업비트 종목 조회 결과값 */
        const bodyJSON = JSON.parse(body);

        /* update db and rate */
        await calcRate(bodyJSON[0].trade_price);

        /* send message to bot */
        sendMessage(bodyJSON);
    });
}, {
    scheduled: false
}).start();


const calcRate = async function( trade_price ) {
    /* calculate change rate */
    change_price_rate_a_minute = 0;
    change_price_rate_three_minute = 0;
    change_price_rate_five_minute = 0;
    change_price_rate_seven_minute = 0;
    change_price_rate_ten_minute = 0;

    /* calculate the average of price */
    avg_price_a_minute = 0;
    avg_price_three_minute = 0;
    avg_price_five_minute = 0;
    avg_price_seven_minute = 0;
    avg_price_ten_minute = 0;


    if ( !cntTicker ) {
        cntTicker = key["market ticker"];
    } else if ( cntTicker != key["market ticker"] ) {
        cntTicker = key["market ticker"];
        db = [];
    }

    /* update db */
    db[10] = db[9];
    avg_price_ten_minute += db[10];

    db[9] = db[8];
    avg_price_ten_minute += db[9];

    db[8] = db[7];
    avg_price_ten_minute += db[8];

    db[7] = db[6];
    avg_price_ten_minute += db[7];
    avg_price_seven_minute += db[7];

    db[6] = db[5];
    avg_price_ten_minute += db[6];
    avg_price_seven_minute += db[6];

    db[5] = db[4];
    avg_price_ten_minute += db[5];
    avg_price_seven_minute += db[5];
    avg_price_five_minute += db[5];

    db[4] = db[3];
    avg_price_ten_minute += db[4];
    avg_price_seven_minute += db[4];
    avg_price_five_minute += db[4];

    db[3] = db[2];
    avg_price_ten_minute += db[3];
    avg_price_seven_minute += db[3];
    avg_price_five_minute += db[3];
    avg_price_three_minute += db[3];

    db[2] = db[1];
    avg_price_ten_minute += db[2];
    avg_price_seven_minute += db[2];
    avg_price_five_minute += db[2];
    avg_price_three_minute += db[2];

    db[1] = db[0];
    avg_price_ten_minute += db[1];
    avg_price_seven_minute += db[1];
    avg_price_five_minute += db[1];
    avg_price_three_minute += db[1];
    avg_price_a_minute += db[1];

    db[0] = trade_price;
    avg_price_ten_minute += db[0];
    avg_price_seven_minute += db[0];
    avg_price_five_minute += db[0];
    avg_price_three_minute += db[0];
    avg_price_a_minute += db[0];

    avg_price_ten_minute /= 11;
    avg_price_seven_minute /= 8;
    avg_price_five_minute /= 6;
    avg_price_three_minute /= 4;
    avg_price_a_minute /= 2;

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


const sendMessage = function(bodyJSON) {
    const hh = bodyJSON[0].trade_time_kst.substr(0,2);
    const mm = bodyJSON[0].trade_time_kst.substr(2,2);
    const ss = bodyJSON[0].trade_time_kst.substr(4,2);

    const sendMsg = "종목: " + bodyJSON[0].market + " / 현재가: " + bodyJSON[0].trade_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"

        + "\n기준 시간(한국 시간): " + hh + "시 " + mm + "분 " + ss + "초\n"
        + "전일 대비: " + (bodyJSON[0].signed_change_rate * 100).toFixed(2).toString() + " %\n"
        + "전일 종가: " + bodyJSON[0].opening_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
        + "금일 고가: " + bodyJSON[0].high_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
        + "금일 저가: " + bodyJSON[0].low_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
        + "금일 중가: " + ((bodyJSON[0].high_price + bodyJSON[0].low_price) / 2).toFixed(0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"

        + "\n단기 변화율\n"
        + "최근  1분 간: " + change_price_rate_a_minute.toFixed(2).toString() + " %\n"
        + "최근  3분 간: " + change_price_rate_three_minute.toFixed(2).toString() + " %\n"
        + "최근  5분 간: " + change_price_rate_five_minute.toFixed(2).toString() + " %\n"
        + "최근  7분 간: " + change_price_rate_seven_minute.toFixed(2).toString() + " %\n"
        + "최근 10분 간: " + change_price_rate_ten_minute.toFixed(2).toString() + " %\n"

        + "\n단기 평균가 대비 시가 증감율\n"
        + "최근  1분 간: " + ((bodyJSON[0].trade_price - avg_price_a_minute).toFixed(2) / avg_price_a_minute * 100).toFixed(2).toString() + " %\n"
        + "최근  3분 간: " + ((bodyJSON[0].trade_price - avg_price_three_minute).toFixed(2) / avg_price_three_minute * 100).toFixed(2).toString() + " %\n"
        + "최근  5분 간: " + ((bodyJSON[0].trade_price - avg_price_five_minute).toFixed(2) / avg_price_five_minute * 100).toFixed(2).toString() + " %\n"
        + "최근  7분 간: " + ((bodyJSON[0].trade_price - avg_price_seven_minute).toFixed(2) / avg_price_seven_minute * 100).toFixed(2).toString() + " %\n"
        + "최근 10분 간: " + ((bodyJSON[0].trade_price - avg_price_ten_minute).toFixed(2) / avg_price_ten_minute * 100).toFixed(2).toString() + " %\n"

        + "\n현재 가격: " + bodyJSON[0].trade_price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n"
        + "거래량: " + (bodyJSON[0].acc_trade_volume - last_acc_trade_volume).toFixed(0).toString().toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.ticker + "\n"
        + "거래액: " + ( avg_price_a_minute.toFixed(0) * (bodyJSON[0].acc_trade_volume - last_acc_trade_volume).toFixed(0) )
                                        .toFixed(0).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') + " " + key.market + "\n";


    const lighthouseJSON = {
        bodyJSON: bodyJSON[0],
        "change_price_rate_a_minute": change_price_rate_a_minute,
        "change_price_rate_three_minute": change_price_rate_three_minute,
        "change_price_rate_five_minute": change_price_rate_five_minute,
        "change_price_rate_seven_minute": change_price_rate_seven_minute,
        "change_price_rate_ten_minute": change_price_rate_ten_minute,
        "avg_price_a_minute_rate": ((bodyJSON[0].trade_price - avg_price_a_minute).toFixed(2) / avg_price_a_minute * 100).toFixed(2),
        "avg_price_three_minute_rate": ((bodyJSON[0].trade_price - avg_price_three_minute).toFixed(2) / avg_price_three_minute * 100).toFixed(2),
        "avg_price_five_minute_rate": ((bodyJSON[0].trade_price - avg_price_five_minute).toFixed(2) / avg_price_five_minute * 100).toFixed(2),
        "avg_price_seven_minute_rate": ((bodyJSON[0].trade_price - avg_price_seven_minute).toFixed(2) / avg_price_seven_minute * 100).toFixed(2),
        "avg_price_ten_minute_rate": ((bodyJSON[0].trade_price - avg_price_ten_minute).toFixed(2) / avg_price_ten_minute * 100).toFixed(2),
        "trade_volume":  (bodyJSON[0].acc_trade_volume - last_acc_trade_volume).toFixed(0),
        "trade_price": ( avg_price_a_minute.toFixed(0) * (bodyJSON[0].acc_trade_volume - last_acc_trade_volume).toFixed(0) ).toFixed(0)
    };

    /* call lighthouse */
    callLighthouse(JSON.stringify(lighthouseJSON));

    last_acc_trade_volume = bodyJSON[0].acc_trade_volume;

    console.log(sendMsg);
    if ( key["shrimp keeper mode"] == "on" ) {
        shrimpKeeperBot.sendMessage(chatId, sendMsg);
    }
}


const shrimpKeeperJob = (mode) => {
    if ( mode == 'on' ) {
        key["shrimp keeper mode"] = "on";
    } else {
        key["shrimp keeper mode"] = "off";
    }
}


module.exports = shrimpKeeperJob;