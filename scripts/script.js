const fs = require("fs");
const unirest = require('unirest');
const { stringify } = require('wkt');
const moment = require('moment-timezone');
const transform_json = require('./transform_json');

const { setIntervalAsync } = require('set-interval-async/dynamic')
const { clearIntervalAsync } = require('set-interval-async')

const time_out = 1000 * 2 // * 1; // ms * sec * min // interval between telraam api calls;
const write_count = 10; // count of after how many new telraam responses you write to the file

exports.get_daily_observations = async function (time_end) {
    let time_start = moment(time_end).subtract(1, 'days').toISOString();
    let date = moment(time_start).utc().format('YYYY-MM-DD');
    console.log("Getting daily observations for: " + date)
    create_file(date);

    let segments_map_local = await get_segments_map();
    let mac_map_local = await get_mac_map();
    let segments_ids = Object.keys(segments_map_local);

    let index = 0;
    let observations_array = [];
    var interval = setIntervalAsync(async () => {
        console.log(index, segments_ids[index]);

        let obs = await get_daily_observation_by_segmentid(segments_ids[index], time_start, time_end);

        if (obs.length > 0) {
            obs = obs[0]
            //console.log(obs.segment_id, obs.uptime)
            let json = transform_json.transform_json(obs, segments_map_local[segments_ids[index]], mac_map_local[segments_ids[index]]);
            //console.log(json)
            observations_array = observations_array.concat(json);
        }

        if (index % write_count == 0 && index != 0) {
            //console.log("write to file", observations_array.length);
            write_to_file(observations_array, date)
            observations_array = [];
        }

        if (index + 1 >= segments_ids.length) {
            write_to_file(observations_array, date)
            clearIntervalAsync(interval);
        }
        index++;

    }, time_out);
    return true
};

// Returs a map:
// K: segment_id
// V: segment camera mac address
async function get_mac_map() {
    let cameras_request = await unirest('GET', 'https://telraam-api.net/v0/cameras');
    let cameras_json = JSON.parse(cameras_request.raw_body);
    let mac_map_local = {};
    cameras_json.cameras.map(camera => {
        mac_map_local[camera.segment_id] = camera.mac;
    });
    return mac_map_local;
}

// Returs a map:
// K: segment_id
// V: segement wkt notation
async function get_segments_map() {
    let segments_request = await unirest('GET', 'https://telraam-api.net/v0/segments/active');
    let segments_json = JSON.parse(segments_request.raw_body);
    let segments_map_local = {};
    segments_json.features.map(segment => {
        segments_map_local[segment.properties.id] = stringify(segment.geometry);
    });
    return segments_map_local;
} 

async function get_daily_observation_by_segmentid(segment_id, time_start, time_end) {
    let observations_request = await unirest('POST', 'https://telraam-api.net/v0/traffic')
        .headers({
            'Content-Type': 'application/json'
        })
        .send(JSON.stringify({
            "level": "segments",
            "format": "per-day",
            "id": [segment_id],
            "time_start": time_start,
            "time_end": time_end
        }));

    let observations_json = JSON.parse(observations_request.raw_body);
    return observations_json;
}

function write_to_file(observations_array, filename) {
    let filepath = "./files/" + filename + ".json";

    fs.readFile(filepath, (err, data) => {
        let json = JSON.parse(data)
        let result = json.concat(observations_array)
        fs.writeFileSync(filepath, JSON.stringify(result))
        console.log("Wrote " + observations_array.length + " objects to file")
    })
}

function create_file(filename) {
    let filepath = "./files/" + filename + ".json";

    fs.writeFileSync(filepath, JSON.stringify([]), function (err, data) {
        if (err) {
            return console.log(err);
        }
        //console.log(data);
    });
    console.log("Succesfully created file: " + filepath)
}
