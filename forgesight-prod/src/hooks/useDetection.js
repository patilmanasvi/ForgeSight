// src/hooks/useDetection.js
import { useState, useCallback } from "react";
import { api } from "../utils/api";

export const useDetection = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeFrame = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.analyzeFrame(file);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyzeFrame, loading, result, error };
};

// src/hooks/useProvenance.js
export const useProvenance = (assetHash) => {
  const [provenance, setProvenance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const prov = await api.getProvenance(assetHash);
      setProvenance(prov);
    } catch (err) {
      console.error("Provenance fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [assetHash]);

  return { provenance, loading, fetch };
};

// src/hooks/useAuditLog.js
import { useEffect } from "react";

export const useAuditLog = (filters = {}) => {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await api.getAuditLog(filters);
        setLog(data.rows || []);
      } catch (err) {
        console.error("Audit log fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [filters]);

  return { log, loading };
};

// src/hooks/useSession.js
export const useSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await api.getSession();
        setSession(data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { session, loading };
};

// src/hooks/useLocalStorage.js
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("LocalStorage error:", error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};
