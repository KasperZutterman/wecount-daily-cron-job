const cron = require('node-cron');
const script = require('./scripts/script');
const moment = require('moment-timezone');

// schedule tasks to be run on the server   
cron.schedule("0 1 * * *", async function () {
  console.log("running a task");

  let date = moment().tz("Europe/Brussels").utcOffset(0).set({ 'h': 0, 'm': 0, 's': 0, 'ms': 0 }).subtract(1, 'days')//.toDate();
  await script.get_daily_observations(date.toISOString());
});

