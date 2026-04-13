// src/views/Save.jsx
import React from "react";
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
} from "@chakra-ui/react";
import { useApp } from "../context/data";

export const Save = () => {
  const {
    getTotalSalesToday,
    resetAllInvoices,
    weeklyRecords,
    saveTodayRecord,
    isTodayRecordSaved,
  } = useApp();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const todayTotal = getTotalSalesToday();
  const todaySaved = isTodayRecordSaved();

  const handleSaveToday = () => {
    if (todayTotal === 0) {
      toast({
        title: "تنبيه",
        description: "لا توجد مبيعات اليوم لحفظها",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    saveTodayRecord();
    toast({
      title: "تم الحفظ",
      description: `تم حفظ إجمالي اليوم (${todayTotal} ₪) في سجل الأيام السبعة`,
      status: "success",
      duration: 3000,
    });
  };

  const handleResetAll = () => {
    // منع التصفير إذا كان اليوم يحتوي على مبيعات ولم يتم حفظ السجل
    if (todayTotal > 0 && !todaySaved) {
      toast({
        title: "لا يمكن التصفير",
        description:
          "يجب حفظ إجمالي اليوم أولاً (زر حفظ الإجمالي) قبل تصفير جميع المبيعات.",
        status: "warning",
        duration: 5000,
      });
      return;
    }
    const success = resetAllInvoices();
    if (success) {
      toast({
        title: "تم التصفير",
        description: "تم حذف جميع الفواتير نهائياً.",
        status: "info",
        duration: 4000,
      });
    }
    onClose();
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
                  ? "✓ تم حفظ هذا اليوم مسبقاً (يمكنك تحديثه بالضغط على زر الحفظ)"
                  : "⚠️ لم يتم حفظ هذا اليوم بعد"}
              </StatHelpText>
            </Stat>
            <Button
              colorScheme="blue"
              onClick={handleSaveToday}
              mt={4}
              w="full"
              isDisabled={todayTotal === 0}>
              حفظ إجمالي اليوم في السجل الأسبوعي
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

      {/* جدول عرض سجل الأيام السبعة */}
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

      {/* زر تصفير جميع الفواتير */}
      <Card
        mt={6}
        bg="red.50"
        _dark={{ bg: "red.900" }}
        borderLeft="4px solid red">
        <CardBody>
          <Heading size="md" mb={2}>
            🗑️ تصفير جميع المبيعات
          </Heading>
          <Text mb={4}>
            سيؤدي هذا الإجراء إلى حذف <strong>جميع الفواتير</strong> بشكل نهائي.
            لا يمكن التراجع عنه.
            {todayTotal > 0 && !todaySaved && (
              <Text as="span" color="red.500" display="block" mt={2}>
                ⚠️ ملاحظة: يجب حفظ إجمالي اليوم أولاً قبل التصفير.
              </Text>
            )}
          </Text>
          <Button
            colorScheme="red"
            onClick={onOpen}
            isDisabled={todayTotal > 0 && !todaySaved}>
            تصفير جميع المبيعات
          </Button>
        </CardBody>
      </Card>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              تأكيد تصفير جميع المبيعات
            </AlertDialogHeader>
            <AlertDialogBody>
              هل أنت متأكد من رغبتك في حذف جميع الفواتير؟ سيتم حذف البيانات
              نهائياً.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                إلغاء
              </Button>
              <Button colorScheme="red" onClick={handleResetAll} ml={3}>
                تصفير الكل
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
