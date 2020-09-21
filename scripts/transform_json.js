const template = {
    "id": "http://localhost:3000/observations_daily#sensor_id",
    "memberOf": "http://localhost:3000/observations_daily",
    "madeBySensor": "http://localhost:3000/sensors#sensor_id",
    "resultTime": "2020-07-06T17:29:13.287Z",
    "hasFeatureOfInterest": {
        "asWKT": "POINT (4.41591365262866 51.2375716958195)"
    },
    "observedProperty": "cot:PM1",
    "hasResult": {
        "numericValue": 2.477860450744629,
        "unit": "m3:MicrogramPerCubicMetre"
    }
}
const features = ["uptime","heavy","car","bike","pedestrian","heavy_lft","heavy_rgt","car_lft","car_rgt","bike_lft","bike_rgt","pedestrian_lft","pedestrian_rgt","direction"];
const url = "http://localhost:3000/observations_daily";

exports.transform_json = function (obs, segment, mac) {
    let json = [];
    features.map(feature => {
        let res = generate_observation_json(obs, segment, mac, feature);
        //console.log(res)
        json.push(JSON.parse(JSON.stringify(res)));
    })
    return json;
}

function generate_observation_json(obs, segment, mac, feature) {
    let res = template;
    res.id = url + "#" + obs.segment_id;
    res.madeBySensor = "http://localhost:3000/cameras#" + mac;
    res.resultTime = obs.date;
    res.hasFeatureOfInterest.asWKT = segment;
    res.observedProperty = "wecount:" + feature;
    res.hasResult.numericValue = obs[feature];
    if (feature === "uptime") {
        res.hasResult.unit = "wecount:pct"
    }
    else {
        res.hasResult.unit = "wecount:counts_per_day";
    }
    
    return res;
}