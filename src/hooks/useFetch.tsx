import { useState, useEffect, useRef } from "react";

interface State<T> {
  data?: T;
  isLoading: boolean;
  hasError: boolean;
  error?: Error;
  updateParams: any;
  refetch: (params: any) => void;
  refetchByUrl: (url: string) => void;
}

type Cache<T> = { [url: string]: T };

function useFetch<T>(
  initialUrl: string,
  initialParams = {},
  skip = false
): State<T> {
  const [url, updateUrl] = useState(initialUrl);
  const [params, updateParams] = useState<any>(initialParams);
  const [data, setData] = useState<T | any>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error>();
  const cache = useRef<Cache<T>>({});

  const refetch = (params: any) => {
    updateParams(params);
  };

  const refetchByUrl = (url: any) => {
    updateUrl(url);
  };

  const queryString = Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    )
    .join("&");

  useEffect(() => {
    if (!url) return;

    let fullUrl: string = `${url}${queryString}`;

    const fetchData = async () => {
      if (skip) return;
      setIsLoading(true);
      try {
        if (cache.current[fullUrl]) {
          const data_ = cache.current[fullUrl];
          setData(data_);
          setIsLoading(false);
        } else {
          const response = await fetch(fullUrl);
          const result = await response.json();
          if (response.ok) {
            cache.current[fullUrl] = result;
            setData(result);
          } else {
            setHasError(true);
            setError(new Error());
          }
        }
      } catch (err: any) {
        setHasError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [url, params]);

  return {
    data,
    isLoading,
    hasError,
    error,
    updateParams,
    refetch,
    refetchByUrl,
  };
}

export default useFetch;
