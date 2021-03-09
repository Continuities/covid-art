import fetch from 'isomorphic-fetch';

const DATA_URL = `https://nineteen.itsmichael.workers.dev/datastore/dump/455fd63b-603d-4608-8216-7d8647f43350?format=json`;

const loadData = async () => {

  const response = await fetch(DATA_URL, {
    // headers: {
    //   'X-Requested-With': 'nineteen-app'
    // }
  });

  if (response.status >= 400) {
    throw new Error("Bad response from server");
  }

  return response.json();
};

const getIndecies = data => {
  const indecies = {};
  for (let i in data.fields) {
    const field = data.fields[i];
    switch (field.id) {
      case 'Accurate_Episode_Date':
        indecies.date = i;
        break;
      case 'Outcome1':
        indecies.outcome = i;
        break;
      case 'Reporting_PHU_City':
        indecies.city = i;
        break;
      case 'Reporting_PHU_Latitude':
        indecies.lat = i;
        break;
      case 'Reporting_PHU_Longitude':
        indecies.long = i;
        break;
    }
  }
  return indecies;
};

export const getData = async () => {
  
  const data = await loadData();
  const indecies = getIndecies(data);

  const byDate = new Map();

  let minLat = null, minLong = null, maxLat = null, maxLong = null;
  for (let r of data.records) {
    // lol this json is just a fancy CSV
    const info = {
      date: new Date(r[indecies.date]),
      resolved: r[indecies.outcome] === 'Resolved',
      city: r[indecies.city],
      lat: r[indecies.lat],
      long: r[indecies.long]
    };
    const key = info.date.getTime();
    if (!byDate.has(key)) {
      byDate.set(key, []);
    }
    byDate.get(key).push(info);
    if (minLat == null || info.lat < minLat) { minLat = info.lat }
    if (minLong == null || info.long < minLong) { minLong = info.long }
    if (maxLat == null || info.lat > maxLat) { maxLat = info.lat }
    if (maxLong == null || info.long > maxLong) { maxLong = info.long }
  }

  return {
    minLat,
    minLong,
    maxLat,
    maxLong,
    records: byDate
  }
};
