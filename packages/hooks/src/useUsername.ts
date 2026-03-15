import { routes } from "@tbe/constants";
import { useApi } from "@tbe/hooks";
import type { APIMakeRquestProps } from "@tbe/interface";
import { useEffect, useRef, useState } from "react";

const useUsername = (userName: string) => {
  const [message, setMessage] = useState<string>();
  const [isUsernameAvailable, setIsUsernameAvailable] =
    useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { response, error, makeRequest } = useApi("check-userName", undefined, {
    enabled: false,
  });

  useEffect(() => {
    if (!userName) {
      setMessage("");
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsChecking(true);
    setMessage("Checking availability...");

    typingTimeoutRef.current = setTimeout(() => {
      const params: APIMakeRquestProps = {
        url: `${routes.api.onboard}?userName=${userName}`,
        method: "GET",
      };
      makeRequest(params);
    }, 1500);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userName]);

  useEffect(() => {
    if (!response) return;

    setIsUsernameAvailable(!!response.data);
    setMessage(response.message);
    setIsChecking(false);
  }, [response]);

  return { message, isUsernameAvailable, isChecking, error };
};

export default useUsername;
