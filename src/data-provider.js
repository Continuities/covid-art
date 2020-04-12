import fetch from 'isomorphic-fetch';
import testData from './test-data.json';

const USE_TEST_DATA = false;
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const DATA_URL = `${CORS_PROXY}https://data.ontario.ca/datastore/dump/455fd63b-603d-4608-8216-7d8647f43350?format=json`;

const loadData = async () => {
  if (USE_TEST_DATA) {
    return testData;
  }

  const response = await fetch(DATA_URL, {
    headers: {
      'X-Requested-With': 'nineteen-app'
    }
  });

  if (response.status >= 400) {
    throw new Error("Bad response from server");
  }

  return response.json();
};

export const getData = async () => {
  
  const data = await loadData();

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