import { useEffect, useState } from 'react';

const useAPIResponseMapper = (
  data: any,
  mappingFunction: any,
  addtionalParams?: any
) => {
  const [mappedData, setMappedData] = useState([]);

  useEffect(() => {
    if (data) {
      const mappedData = mappingFunction(data, addtionalParams);
      setMappedData(mappedData);
    }
  }, [data, mappingFunction]);

  return mappedData;
};

export default useAPIResponseMapper;
