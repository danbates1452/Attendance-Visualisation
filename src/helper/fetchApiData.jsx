import {useEffect, useState} from 'react';
//import axios from 'axios';

//functional component that handles fetching raw data from api
export default function FetchAPIData(endpoint) {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error('HTTP Error, Status: ' + response.status);
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((err) => console.log(err.message))
    }, [endpoint]);
    return data
}