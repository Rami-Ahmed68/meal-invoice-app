import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  Icon,
  Text,
  useColorMode,
  Switch,
  HStack,
} from "@chakra-ui/react";
import {
  ViewIcon,
  AddIcon,
  AtSignIcon,
  CalendarIcon,
  SunIcon,
  MoonIcon,
} from "@chakra-ui/icons";

const Sidebar = () => {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  const menuItems = [
    { name: "الرئيسية", path: "/", icon: ViewIcon },
    { name: "المبيعات", path: "/sales", icon: AddIcon },
    { name: "الأصناف", path: "/categories", icon: AtSignIcon },
    { name: "الوجبات", path: "/meals", icon: CalendarIcon },
    { name: "حفظ", path: "/save", icon: AddIcon },
  ];

  return (
    <Box
      as="aside"
      w="260px"
      bg="card-bg"
      h="100vh"
      position="fixed"
      top="0"
      right="0"
      borderLeft="1px solid"
      borderColor="border-default"
      p={4}
      zIndex="sticky"
      boxShadow="sm">
      <Flex direction="column" h="full">
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          mb={8}
          color="text.primary" // لون النص الرئيسي من الثيم
        >
          نظام الفواتير
        </Text>

        <VStack spacing={2} align="stretch" flex="1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                to={item.path}
                key={item.path}
                style={{ textDecoration: "none" }}>
                <Flex
                  align="center"
                  p={3}
                  borderRadius="md"
                  bg={isActive ? "blue.100" : "transparent"}
                  _dark={{
                    bg: isActive ? "blue.900" : "transparent",
                    color: isActive ? "blue.300" : "text.mutedDark",
                  }}
                  color={isActive ? "blue.600" : "text.muted"}
                  _hover={{
                    bg: isActive ? "blue.100" : "gray.100",
                    _dark: { bg: isActive ? "blue.900" : "gray.700" },
                  }}
                  transition="all 0.2s">
                  <Icon as={item.icon} mr={3} boxSize={5} />
                  <Text fontWeight={isActive ? "bold" : "normal"}>
                    {item.name}
                  </Text>
                </Flex>
              </Link>
            );
          })}
        </VStack>

        <HStack
          justify="space-between"
          pt={4}
          mt="auto"
          borderTopWidth="1px"
          borderColor="border-default">
          <HStack spacing={2}>
            {colorMode === "light" ? <SunIcon /> : <MoonIcon />}
            <Text fontSize="sm" color="text.muted">
              الوضع الليلي
            </Text>
          </HStack>
          <Switch
            isChecked={colorMode === "dark"}
            onChange={toggleColorMode}
            colorScheme="blue"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Sidebar;
