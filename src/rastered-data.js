const RasteredData = (input, resolution) => {

  const latQuantum = (input.maxLat - input.minLat) / resolution;
  const longQuantum = (input.maxLong - input.minLong) / resolution;

  const mapToPoint = (lat, long) => ({
    x: Math.min(Math.floor((long - input.minLong) / longQuantum), resolution - 1),
    y: (resolution - 1) - Math.min(Math.floor((lat - input.minLat) / latQuantum), resolution - 1)
  });

  const rastered = new Map();
  const cities = Array(resolution).fill().map(() => Array(resolution).fill().map(() => new Set()));
  for (let date of input.records.keys()) {
    const frame = {
      active: [],
      recovered: [],
      total: [],
      cities: []
    };
    for (let x = 0; x < resolution; x++) {
      frame.active[x] = Array(resolution).fill(0);
      frame.recovered[x] = Array(resolution).fill(0);
      frame.total[x] = Array(resolution).fill(0);
    }
    const dayData = input.records.get(date);
    for (let record of dayData) {
      const p = mapToPoint(record.lat, record.long);
      frame[record.recovered ? 'recovered' : 'active'][p.x][p.y] += 1;
      frame.total[p.x][p.y] += 1;
      cities[p.x][p.y].add(record.city);
    }
    rastered.set(date, frame);
  }
  return {
    data: rastered,
    cities
  };
};

export default RasteredData;