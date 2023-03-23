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
      datasets.push({label: d, data: extractedDetails[d]})
    }
  
    return {
      labels: labels,
      datasets: datasets,
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
      datasets.push({label: d, data: extractedDetails[d]})
    }
  
    return {
      labels: labels,
      datasets: datasets,
    }
    
  }
  
 export function ChartOptions(title, xTitle, yTitle) {
    return {
      responsive: true,
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