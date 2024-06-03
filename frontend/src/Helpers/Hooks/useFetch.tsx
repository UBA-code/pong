import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface redirectObj {
  message: string;
  redirectTo: string;
}

export default function useFetch<T>(url: string) {
  const navigate = useNavigate();
  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const res = await axios
        .get(url, { withCredentials: true })
        .then((res) => res.data)
        .then((response: redirectObj) => {
          if (
            response.message === "Unauthorized" ||
            response.message === "user not logged in"
          ) {
            navigate(response.redirectTo);
            return 0;
          }
          if (response.message === "Token refreshed") {
            return axios
              .get(url, { withCredentials: true })
              .then((lastResponse) => lastResponse.data);
          } else {
            return response;
          }
        })
        .catch((err) => {
          console.log(err);
          return 0;
        });
      return res as T;
    },
  });
}
