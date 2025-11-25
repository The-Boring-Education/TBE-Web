import {useEffect,useState} from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);

        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    return isMobile;
}

// Performance optimization hooks
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function useThrottle<T>(value: T, limit: number): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const [lastRun, setLastRun] = useState(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRun >= limit) {
                setThrottledValue(value);
                setLastRun(Date.now());
            }
        }, limit - (Date.now() - lastRun));

        return () => {
            clearTimeout(handler);
        };
    }, [value, limit, lastRun]);

    return throttledValue;
}

export function useIntersectionObserver(
    ref: React.RefObject<Element>,
    options: IntersectionObserverInit = {}
) {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) {return;}

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (entry) {
                    setIsIntersecting(entry.isIntersecting);
                }
            },
            {
                rootMargin: "50px",
                threshold: 0.1,
                ...options
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [ref, options]);

    return isIntersecting;
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}
