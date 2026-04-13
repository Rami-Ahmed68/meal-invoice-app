import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import theme from "./ui/theme";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"; // أضف هذا

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);

// أضف هذا السطر
serviceWorkerRegistration.register();
