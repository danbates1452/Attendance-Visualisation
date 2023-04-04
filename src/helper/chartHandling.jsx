import ColorHash from "color-hash";
const colorHash = new ColorHash();

const borderColor = 'CCCCCC44';

function getTranslucentColorHash(string) {
  return colorHash.hex(string) + '99';
}

function backgroundColorArray(labelList) {
  let bgColours = [];
  for (let label in labelList) {
    bgColours.push(getTranslucentColorHash(label))
  }
  return bgColours;
}

export function ExtractChartData(raw, details, subvalue='None') {
    let labels = [];
    let extractedDetails = {};
    for (let d in details) {
      extractedDetails[details[d]] = []
    }
    for (let key in raw) {
      //key = top level key of each dict
      if (subvalue === 'None') {
        labels.push('Week ' + raw[key]['week']);
      }
      
      for (let d in extractedDetails) {
        if (subvalue === 'None') {
          extractedDetails[d].push(raw[key][d]);
        } else {
          extractedDetails[d].push(raw[key][d][subvalue]);
          labels.push(d)
        }
      }
    }
    
    let datasets = [];
    for (let d in extractedDetails) {
      datasets.push({label: d, data: extractedDetails[d], backgroundColor: backgroundColorArray(labels), borderColor: getTranslucentColorHash(d)})
    }
  
    return {
      labels: labels,
      datasets: datasets,
    }
  }

export function percentageChartData(raw, numerator, denominator, name, subvalue='None') {
  let labels = [];
  let data = [];

  for (let key in raw) { //top level e.g. list of snapshots
    labels.push('Week ' + raw[key]['week']);
    let numeratorValue, denominatorValue;
    if (subvalue === 'None') {
      numeratorValue = Number(raw[key][numerator]);
      denominatorValue = Number(raw[key][denominator]);
    } else {
      numeratorValue = Number(raw[key][numerator][subvalue]);
      denominatorValue = Number(raw[key][denominator][subvalue]);
    }
    if (numeratorValue !== 0 && denominatorValue !== 0) {
      const percentage = (numeratorValue / denominatorValue) * 100;
      data.push(percentage);
    } else {
      data.push(0);
    }
  }
  
  return {
    labels: labels,
    datasets: [{label: name, data: data, backgroundColor: backgroundColorArray(labels), borderColor: getTranslucentColorHash(name)}],
  }
}

export function percentageAggregateChartData(raw, numerator, denominator, name, subvalue='None') {
  let labels = [];
  let data = [];

  for (let week in raw[numerator]) { //only need to loop for numerator as denominator should have the same number of weeks
    labels.push('Week ' + week);

    const numeratorValue = Number(raw[numerator][week][subvalue]);
    const denominatorValue = Number(raw[denominator][week][subvalue]);

    if (numeratorValue !== 0 && denominatorValue !== 0) {
      const percentage = (numeratorValue / denominatorValue) * 100;
      data.push(percentage);
    } else {
      data.push(0);
    }
  }
  
  return {
    labels: labels,
    datasets: [{label: name, data: data, backgroundColor: backgroundColorArray(labels), borderColor: getTranslucentColorHash(name)}],
  }
}
  
export function ExtractAggregateData(raw, details, subvalue) {
    let labels = [];
    let extractedDetails = {};
  
    for (let d in details) {
      extractedDetails[details[d]] = []
    } 
  
    for (let key in raw) { //e.g. 'teaching_sessions'
      for (let week in raw[key]) {
        if (Object.keys(raw)[0] === key) { //if first attribute
          labels.push('Week ' + week);
        }
  
        if (details.includes(key)) {
          extractedDetails[key].push(raw[key][week][subvalue]);
        }
      }    
    }
  
    let datasets = [];
    for (let d in extractedDetails) {
      datasets.push({label: d, data: extractedDetails[d], backgroundColor: backgroundColorArray(labels), borderColor: getTranslucentColorHash(d)})
    }
  
    return {
      labels: labels,
      datasets: datasets,
    }
    
  }
  
 export function LinearChartOptions(title, xTitle, yTitle) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: true
        },
        title: {
          display: true,
          text: title
        }
      },
      hover: {
        mode: 'index',
        intersect: true
      },
      scales : {
        x: {
          title: {
            display: true,
            text: xTitle
          }
        },
        y: {
          title: {
            display: true,
            text: yTitle
          }
        }
      }
    }
  }

//essentially the same as linear chart options but without enforced scales
export function CircularChartOptions(title) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: true
      },
      title: {
        display: true,
        text: title
      },
      colors: {
        enabled: true
      }
    },
    hover: {
      mode: 'index',
      intersect: true
    }
  }
}