import fetch from 'isomorphic-fetch';

const DATA_URL = 'https://data.ontario.ca/datastore/dump/455fd63b-603d-4608-8216-7d8647f43350?format=json';

export const getData = async () => {
  const response = await fetch(DATA_URL);
  if (response.status >= 400) {
    throw new Error("Bad response from server");
  }
  const data = await response.json();

  const byDate = new Map();

  let minLat = null, minLong = null, maxLat = null, maxLong = null;
  for (let r of data.records) {
    // lol this json is just a fancy CSV
    const info = {
      date: new Date(r[2]),
      resolved: r[6] === 'Resolved',
      lat: r[12],
      long: r[13]
    };
    const key = info.date.toLocaleDateString();
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