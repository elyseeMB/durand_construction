import { useEffect, useState } from "preact/hooks";

export function useFetch<T>(url: string, options: RequestInit = {}) {
  const [data, setData] = useState<T | null | string>(null);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((r) => r.text())
      .then((data) => {
        setData(data);
      })
      .catch((e) => {
        setErrors(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return {
    loading,
    data,
    errors,
  };
}
