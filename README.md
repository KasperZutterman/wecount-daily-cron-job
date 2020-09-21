# Wecount daily cron job

## run daily job
```node .\index.js```

## Fill historical data on new deployment
```node .\history_data.js```

## About

the cron job runs at 01:00, it iterates all active cameras for their daily traffic report of 2 days prior and writes it to a json file.
(This json file is used by the [wecount-datastream-API](https://github.com/KasperZutterman/wecount-datastream-API) observations_daily endpoint.

The test.js script has the same code as the cron job and can be used to see if the code the cron job executes works. It can be run by ```node .\test.js```

To load all historical data from the telraam API, you should run ```node .\history_data.js```, this iterates over all days (+-2 hours per day) and writes these to their corresponding json file.
