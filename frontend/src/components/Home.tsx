import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../redux/store";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Home() {
  
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {/*switch between login and home page*/}
        <Outlet />
      </QueryClientProvider>
    </Provider>
  );
}
