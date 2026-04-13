import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProvider } from "./context/data"; // المسار الصحيح لملف السياق
import theme from "./ui/theme";
// import { Dashboard } from "./views/Dashboard";
import { Home } from "./views/Home";
import { Sales } from "./views/Sales";
import { Categories } from "./views/Categories";
import { Meals } from "./views/Meals";
import { Save } from "./views/Save";
import Sidebar from "./components/Sidebar";
import { Box, Flex } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AppProvider>
        {" "}
        {/* 🔴 هذا السطر هو المهم - يجب أن يكون موجوداً */}
        <Router>
          <Flex>
            <Sidebar />
            <Box flex="1" mr="260px" p={6}>
              <Routes>
                {/* <Route path="/" element={<Dashboard />} /> */}
                <Route path="/" element={<Home />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/meals" element={<Meals />} />
                <Route path="/save" element={<Save />} />
              </Routes>
            </Box>
          </Flex>
        </Router>
      </AppProvider>
    </ChakraProvider>
  );
}

export default App;
