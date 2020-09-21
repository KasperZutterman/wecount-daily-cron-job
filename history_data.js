const script = require('./scripts/script');
const moment = require('moment-timezone');
const { setIntervalAsync } = require('set-interval-async/dynamic')
const { clearIntervalAsync } = require('set-interval-async/dynamic')

const start_date = "2019-05-20"
const time_out = 1000 * 60 * 60 * 2; // ms * sec * min * h // time interval between request for 1 day
/*
    The request for 1 whole day to finish takes about 1.5 - 2 hours
*/

console.log("filling historical data");
let date_start = moment(start_date).tz("Europe/Brussels").utcOffset(0).set({'h':0, 'm':0, 's':0, 'ms':0})//.subtract(1, 'days')//.toDate();
let date_end = moment().tz("Europe/Brussels").utcOffset(0).set({'h':0, 'm':0, 's':0, 'ms':0}).subtract(1, 'days')
let date_counter = date_start;
let date_array = [];
//console.log(date_start, date_end)


// Build array with all needed dates:
while (date_counter < date_end) {
    date_array.push(moment(date_counter).tz("Europe/Brussels").utcOffset(0).set({'h':0, 'm':0, 's':0, 'ms':0}))
    date_counter.add(1, 'days');
}

let index = 0;

// Iterate all dates and fill the coresponding json file (same request as daily cron job)
var interval = setIntervalAsync(async () => {
    console.log(date_array[index]);
    await script.get_daily_observations(date_array[index].toISOString());
    if (index + 1 >= date_array.length) {
        console.log("filling historical data complete!");
        clearIntervalAsync(interval);
    }
    index++;

}, time_out);