import {useEffect, useState} from 'react';
import axios from 'axios';

//functional component that handles fetching raw data from api
export default function FetchAPIData(endpoint) {
    const [data, setData] = useState([]);
  
    useEffect((endpoint) => {
      const fetchData = async () => {
        const result = await axios(
          endpoint
        );
        setData(result.data)
      };
      fetchData();
    }, []);
    return data
}