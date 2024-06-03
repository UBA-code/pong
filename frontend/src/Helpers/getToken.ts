import axios from "axios";

type errorResponseObj = {
  message: string;
};

export default async function getToken() {
  const res = await axios
    .get(
      `http://${import.meta.env.VITE_BACKEND_HOST}:${
        import.meta.env.VITE_BACKEND_PORT
      }/auth/token`,
      {
        withCredentials: true,
      }
    )
    .then((response) => response.data)
    .catch((err) => {
      console.log("getToken Failed");
      console.log(err);
    });

  if ((res as errorResponseObj).message === "Token refreshed") {
    return getToken();
  }
  return res;
}
