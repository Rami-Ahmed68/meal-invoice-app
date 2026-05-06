// src/views/Save.jsx
import React, { useState, useRef } from "react";
import {
  Box,
  Heading,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardBody,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useApp } from "../context/data";

// كلمة السر الثابتة
const MASTER_PASSWORD = "admin123";

export const Save = () => {
  const {
    getTotalSalesToday,
    resetAllInvoices,
    weeklyRecords,
    saveTodayRecord,
    isTodayRecordSaved,
  } = useApp();
  const toast = useToast();

  // حوار إدخال كلمة السر
  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const passwordInputRef = useRef();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const todayTotal = getTotalSalesToday();
  const todaySaved = isTodayRecordSaved();

  const handleSaveAndReset = () => {
    if (todayTotal === 0 && !todaySaved) {
      toast({
        title: "تنبيه",
        description: "لا توجد مبيعات اليوم لحفظها ولا توجد فواتير لتصفيرها.",
        status: "info",
        duration: 3000,
      });
      onPasswordClose();
      return;
    }
    if (password !== MASTER_PASSWORD) {
      setPasswordError("كلمة السر غير صحيحة");
      return;
    }
    setPasswordError("");
    if (todayTotal > 0) {
      saveTodayRecord();
      toast({
        title: "تم الحفظ",
        description: `تم حفظ إجمالي اليوم (${todayTotal} ₪) في السجل الأسبوعي.`,
        status: "success",
        duration: 3000,
      });
    }
    resetAllInvoices();
    toast({
      title: "تم التصفير",
      description: "تم حذف جميع الفواتير نهائياً.",
      status: "info",
      duration: 4000,
    });
    onPasswordClose();
    setPassword("");
  };

  const openPasswordDialog = () => {
    if (todayTotal === 0 && !todaySaved) {
      toast({
        title: "تنبيه",
        description: "لا توجد مبيعات اليوم لحفظها ولا توجد فواتير لتصفيرها.",
        status: "info",
        duration: 3000,
      });
      return;
    }
    setPassword("");
    setPasswordError("");
    onPasswordOpen();
  };

  return (
    <Box>
      <Heading mb={6}>حفظ البيانات والمقارنة</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>💰 إجمالي مبيعات اليوم الحالي</StatLabel>
              <StatNumber fontSize="3xl">{todayTotal} ₪</StatNumber>
              <StatHelpText>
                {todaySaved
                  ? "✓ تم حفظ هذا اليوم مسبقاً (سيتم تحديثه عند الحفظ)"
                  : "⚠️ لم يتم حفظ هذا اليوم بعد"}
              </StatHelpText>
            </Stat>
            <Button
              colorScheme="blue"
              onClick={openPasswordDialog}
              mt={4}
              w="full"
              isDisabled={
                todayTotal === 0 && todaySaved && weeklyRecords.length === 0
              }>
              حفظ إجمالي اليوم وتصفير جميع المبيعات
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>📊 سجل آخر 7 أيام</StatLabel>
              <StatNumber fontSize="2xl">{weeklyRecords.length}</StatNumber>
              <StatHelpText>عدد الأيام المسجلة</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mt={6}>
        <CardBody>
          <Heading size="md" mb={4}>
            سجل المبيعات (آخر 7 أيام)
          </Heading>
          {weeklyRecords.length === 0 ? (
            <Text>لا توجد سجلات بعد. استخدم زر الحفظ لإضافة اليوم.</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>التاريخ</Th>
                  <Th>إجمالي المبيعات (₪)</Th>
                  <Th>التصنيف</Th>
                </Tr>
              </Thead>
              <Tbody>
                {weeklyRecords.map((record, idx) => (
                  <Tr key={idx}>
                    <Td>{record.date}</Td>
                    <Td>{record.amount}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          record.keyword === "ضعيف"
                            ? "red"
                            : record.keyword === "مقبول"
                              ? "yellow"
                              : record.keyword === "جيد"
                                ? "green"
                                : record.keyword === "قوي"
                                  ? "blue"
                                  : record.keyword === "قوي جداً"
                                    ? "purple"
                                    : "gray"
                        }>
                        {record.keyword}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <AlertDialog
        isOpen={isPasswordOpen}
        leastDestructiveRef={passwordInputRef}
        onClose={onPasswordClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              تأكيد العملية
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>
                سيتم حفظ إجمالي اليوم (إن وجد) ثم حذف جميع الفواتير نهائياً.
              </Text>
              <FormControl isInvalid={!!passwordError}>
                <FormLabel>أدخل كلمة السر:</FormLabel>
                <Input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSaveAndReset()}
                  placeholder="********"
                />
                {passwordError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {passwordError}
                  </Text>
                )}
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onPasswordClose}>
                إلغاء
              </Button>
              <Button colorScheme="blue" onClick={handleSaveAndReset} ml={3}>
                تأكيد
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
