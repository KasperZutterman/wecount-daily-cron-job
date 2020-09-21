const script = require('./scripts/script');
const moment = require('moment-timezone');

console.log("running a test");
let date = moment().tz("Europe/Brussels").utcOffset(0).set({'h':0, 'm':0, 's':0, 'ms':0}).subtract(1, 'days')//.toDate();

script.get_daily_observations(date.toISOString());

