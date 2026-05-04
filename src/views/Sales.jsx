// src/views/Sales.jsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  Button,
  Wrap,
  WrapItem,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useApp } from "../context/data";

export const Sales = () => {
  const {
    invoices,
    meals,
    getAggregatedSalesByMeal,
    getTotalSalesToday,
    weeklyRecords,
    getCategoryName,
  } = useApp();
  const [tabIndex, setTabIndex] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [allCount, setAllCount] = useState(0);
  const [groupingMode, setGroupingMode] = useState("exact"); // 'exact', 'customKeyword', 'category'
  const [customKeywords, setCustomKeywords] = useState("");
  const [customGroups, setCustomGroups] = useState([]);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    const number = typeof num === "number" ? num : parseFloat(num);
    if (isNaN(number)) return "0";
    return number.toLocaleString("en-US").replace(/,/g, ".");
  };

  const calculateAllTotals = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const count = invoices.length;
    setAllTotal(total);
    setAllCount(count);
  };

  const getBasePrice = (meal, type) => {
    if (!meal) return null;
    if (meal.availableTypes === "single") return meal.singlePrice;
    if (type === "sandwich") return meal.sandwichPrice;
    if (type === "meal") return meal.mealPrice;
    return null;
  };

  const isDiscounted = (item, meal) => {
    const basePrice = getBasePrice(meal, item.type);
    if (!basePrice) return false;
    return item.price < basePrice;
  };

  const aggregatedSales = getAggregatedSalesByMeal().map((sale) => {
    const meal = meals.find((m) => m.id === sale.mealId);
    const basePrice = getBasePrice(meal, sale.type);
    const discounted = basePrice !== null && sale.price < basePrice;
    return { ...sale, meal, basePrice, discounted };
  });

  const getDailyStats = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

    let todayTotal = 0,
      yesterdayTotal = 0;
    let todayInvoiceCount = 0,
      yesterdayInvoiceCount = 0;
    let todayUniqueItems = new Set(),
      yesterdayUniqueItems = new Set();

    invoices.forEach((inv) => {
      const invDateStr = new Date(inv.date).toISOString().slice(0, 10);
      if (invDateStr === todayStr) {
        todayTotal += inv.total;
        todayInvoiceCount++;
        inv.items.forEach((item) => {
          todayUniqueItems.add(`${item.mealId}_${item.type}`);
        });
      } else if (invDateStr === yesterdayStr) {
        yesterdayTotal += inv.total;
        yesterdayInvoiceCount++;
        inv.items.forEach((item) => {
          yesterdayUniqueItems.add(`${item.mealId}_${item.type}`);
        });
      }
    });

    const difference = todayTotal - yesterdayTotal;
    const percentChange =
      yesterdayTotal === 0
        ? todayTotal > 0
          ? 100
          : 0
        : (difference / yesterdayTotal) * 100;
    return {
      todayTotal,
      yesterdayTotal,
      difference,
      percentChange,
      todayInvoiceCount,
      yesterdayInvoiceCount,
      todayUniqueItemsCount: todayUniqueItems.size,
      yesterdayUniqueItemsCount: yesterdayUniqueItems.size,
    };
  };

  const dailyStats = getDailyStats();

  const weeklyStatsFromRecords = useMemo(() => {
    return [...weeklyRecords].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [weeklyRecords]);

  const todayTotal = getTotalSalesToday();

  const savedRecordsAvg = useMemo(() => {
    if (weeklyRecords.length === 0) return 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const filtered = weeklyRecords.filter((rec) => rec.date !== todayStr);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, rec) => acc + rec.amount, 0);
    return sum / filtered.length;
  }, [weeklyRecords]);

  const getPerformanceRating = (amount, avg) => {
    if (avg === 0) {
      if (amount === 0)
        return { text: "لا مبيعات", color: "gray", emoji: "⚪" };
      return { text: "جيد جداً", color: "green", emoji: "🌟" };
    }
    const ratio = amount / avg;
    if (ratio >= 1.5) return { text: "قوي جداً", color: "purple", emoji: "🚀" };
    if (ratio >= 1.2) return { text: "قوي", color: "blue", emoji: "💪" };
    if (ratio >= 0.9) return { text: "جيد", color: "green", emoji: "👍" };
    if (ratio >= 0.6) return { text: "مقبول", color: "yellow", emoji: "👌" };
    return { text: "ضعيف", color: "red", emoji: "⚠️" };
  };

  const todayPerformance = getPerformanceRating(todayTotal, savedRecordsAvg);
  const differenceFromAvg = todayTotal - savedRecordsAvg;
  const percentFromAvg =
    savedRecordsAvg === 0
      ? todayTotal > 0
        ? 100
        : 0
      : (differenceFromAvg / savedRecordsAvg) * 100;

  // ---- تجميع حسب الاسم الدقيق ----
  const exactNameGroups = useMemo(() => {
    const groups = new Map();
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const name = item.mealName;
        if (!groups.has(name)) {
          groups.set(name, {
            name: name,
            totalAmount: 0,
            totalQuantity: 0,
            invoiceCount: 0,
            types: new Set(),
          });
        }
        const entry = groups.get(name);
        entry.totalAmount += item.total;
        entry.totalQuantity += item.quantity;
        entry.invoiceCount += 1;
        entry.types.add(item.type);
      });
    });
    const result = Array.from(groups.values()).map((entry) => {
      const mostCommonType =
        entry.types.size === 1 ? Array.from(entry.types)[0] : "mixed";
      return { ...entry, displayType: mostCommonType };
    });
    return result.sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [invoices]);

  // ---- تجميع حسب الكلمات المفتاحية المخصصة ----
  const handleKeywordGrouping = () => {
    if (!customKeywords.trim()) {
      setCustomGroups([]);
      return;
    }
    const keywords = customKeywords
      .split(/[\s,]+/)
      .filter((k) => k.trim().length > 0)
      .map((k) => k.toLowerCase());
    if (keywords.length === 0) return;

    const groups = new Map();
    keywords.forEach((kw) => {
      groups.set(kw, {
        keyword: kw,
        totalAmount: 0,
        totalQuantity: 0,
        invoiceCount: 0,
      });
    });

    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const itemName = item.mealName.toLowerCase();
        for (const [kw, group] of groups.entries()) {
          if (itemName.includes(kw)) {
            group.totalAmount += item.total;
            group.totalQuantity += item.quantity;
            group.invoiceCount += 1;
          }
        }
      });
    });

    const result = Array.from(groups.values()).filter((g) => g.totalAmount > 0);
    setCustomGroups(result);
  };

  // ---- تجميع حسب الأصناف ----
  const categoryGroups = useMemo(() => {
    const groups = new Map(); // key = categoryId
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const meal = meals.find((m) => m.id === item.mealId);
        if (!meal) return;
        const catId = meal.categoryId;
        const catName = getCategoryName(catId);
        if (!groups.has(catId)) {
          groups.set(catId, {
            categoryId: catId,
            categoryName: catName,
            totalAmount: 0,
            totalQuantity: 0,
            invoiceCount: 0,
          });
        }
        const entry = groups.get(catId);
        entry.totalAmount += item.total;
        entry.totalQuantity += item.quantity;
        entry.invoiceCount += 1;
      });
    });
    return Array.from(groups.values()).sort(
      (a, b) => b.totalAmount - a.totalAmount,
    );
  }, [invoices, meals, getCategoryName]);

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const redBg = useColorModeValue("red.50", "red.900");
  const redBorder = useColorModeValue("red.300", "red.700");

  return (
    <Box>
      <Heading mb={6}>المبيعات والتقارير</Heading>

      <Card mb={6} bg={bgCard} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Stat>
              <StatLabel>📊 إجمالي الفواتير (جميع المبيعات)</StatLabel>
              <StatNumber>{formatNumber(allTotal)} ₪</StatNumber>
              <StatHelpText>عدد الفواتير الإجمالي: {allCount}</StatHelpText>
            </Stat>
            <Button colorScheme="blue" onClick={calculateAllTotals}>
              حساب الإجمالي
            </Button>
          </Flex>
        </CardBody>
      </Card>

      <Card mb={6} bg={bgCard} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Stat>
              <StatLabel>💰 مبيعات اليوم</StatLabel>
              <StatNumber>{formatNumber(dailyStats.todayTotal)} ₪</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>📄 فواتير اليوم</StatLabel>
              <StatNumber>{dailyStats.todayInvoiceCount}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>🍽️ أصناف مباعة (فريدة) اليوم</StatLabel>
              <StatNumber>{dailyStats.todayUniqueItemsCount}</StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      <Tabs index={tabIndex} onChange={setTabIndex} isLazy>
        <TabList>
          <Tab>الفواتير (جميع الفواتير)</Tab>
          <Tab>تقرير المبيعات المجمّع (حسب السعر)</Tab>
          <Tab>الإحصائيات الأسبوعية (من السجلات المحفوظة)</Tab>
          <Tab>تجميع المبيعات</Tab>
        </TabList>

        <TabPanels>
          {/* الفواتير - بدون تغيير */}
          <TabPanel p={0} pt={4}>
            {invoices.length === 0 ? (
              <Text>لا توجد فواتير حتى الآن.</Text>
            ) : (
              <Accordion allowMultiple>
                {invoices.map((inv) => (
                  <AccordionItem
                    key={inv.id}
                    borderWidth="1px"
                    borderRadius="md"
                    mb={4}
                    borderColor={borderColor}>
                    <AccordionButton
                      _expanded={{ bg: "blue.50", _dark: { bg: "blue.900" } }}
                      p={4}>
                      <Box flex="1" textAlign="right">
                        <Flex
                          justify="space-between"
                          align="center"
                          wrap="wrap">
                          <Text fontWeight="bold">فاتورة رقم {inv.id}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(inv.date).toLocaleString("ar-EG")}
                          </Text>
                          <Badge colorScheme="green" fontSize="md">
                            الإجمالي: {formatNumber(inv.total)} ₪
                          </Badge>
                        </Flex>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} pt={2}>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>المادة</Th>
                            <Th>النوع</Th>
                            <Th>السعر الأصلي</Th>
                            <Th>سعر البيع</Th>
                            <Th>الكمية</Th>
                            <Th>المجموع</Th>
                            <Th>حالة السعر</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {inv.items.map((item, idx) => {
                            const meal = meals.find(
                              (m) => m.id === item.mealId,
                            );
                            const basePrice = getBasePrice(meal, item.type);
                            const discounted = meal && isDiscounted(item, meal);
                            return (
                              <Tr
                                key={idx}
                                bg={discounted ? redBg : undefined}
                                _hover={{
                                  bg: discounted ? "red.100" : "gray.100",
                                }}>
                                <Td>{item.mealName}</Td>
                                <Td>
                                  {item.type === "sandwich"
                                    ? "صندويشة"
                                    : item.type === "meal"
                                      ? "وجبة كاملة"
                                      : "مادة مفردة"}
                                </Td>
                                <Td>
                                  {basePrice ? formatNumber(basePrice) : "-"} ₪
                                </Td>
                                <Td>{formatNumber(item.price)} ₪</Td>
                                <Td>{item.quantity}</Td>
                                <Td>{formatNumber(item.total)} ₪</Td>
                                <Td>
                                  {discounted ? (
                                    <Badge colorScheme="red">مخفض</Badge>
                                  ) : (
                                    <Badge colorScheme="green">سعر عادي</Badge>
                                  )}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabPanel>

          {/* التقرير المجمع */}
          <TabPanel p={0} pt={4}>
            {aggregatedSales.length === 0 ? (
              <Text>لا توجد مبيعات مسجلة.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {aggregatedSales.map((sale, idx) => (
                  <Card
                    key={idx}
                    bg={sale.discounted ? redBg : bgCard}
                    borderWidth="2px"
                    borderColor={sale.discounted ? redBorder : borderColor}
                    borderRadius="lg"
                    transition="all 0.2s"
                    _hover={{ transform: "scale(1.02)" }}>
                    <CardBody>
                      <Heading size="md" mb={2}>
                        {sale.mealName}
                      </Heading>
                      <Badge
                        mb={3}
                        colorScheme={
                          sale.type === "sandwich"
                            ? "orange"
                            : sale.type === "meal"
                              ? "green"
                              : "purple"
                        }>
                        {sale.type === "sandwich"
                          ? "صندويشة"
                          : sale.type === "meal"
                            ? "وجبة كاملة"
                            : "مادة مفردة"}
                      </Badge>
                      {sale.discounted && (
                        <Badge ml={2} colorScheme="red">
                          مخفض
                        </Badge>
                      )}
                      <Stat mt={2}>
                        <StatLabel>سعر البيع</StatLabel>
                        <StatNumber>{formatNumber(sale.price)} ₪</StatNumber>
                        {sale.basePrice && (
                          <StatHelpText>
                            السعر الأساسي: {formatNumber(sale.basePrice)} ₪
                            {sale.discounted &&
                              ` (تخفيض ${formatNumber(
                                sale.basePrice - sale.price,
                              )} ₪)`}
                          </StatHelpText>
                        )}
                      </Stat>
                      <Stat>
                        <StatLabel>الكمية المباعة</StatLabel>
                        <StatNumber>{sale.totalQuantity}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>الإجمالي</StatLabel>
                        <StatNumber>
                          {formatNumber(sale.totalAmount)} ₪
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>عدد مرات البيع</StatLabel>
                        <StatNumber>{sale.saleCount}</StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* الإحصائيات الأسبوعية */}
          <TabPanel p={0} pt={4}>
            <Card mb={4} bg={bgCard} borderColor={todayPerformance.color}>
              <CardBody>
                <Flex justify="space-between" align="center" wrap="wrap">
                  <Stat>
                    <StatLabel>أداء اليوم (مقارنة بالسجلات المحفوظة)</StatLabel>
                    <StatNumber>{formatNumber(todayTotal)} ₪</StatNumber>
                    <StatHelpText>
                      متوسط الأيام المسجلة: {formatNumber(savedRecordsAvg)} ₪
                    </StatHelpText>
                    <StatHelpText fontWeight="bold">
                      الفرق: {differenceFromAvg >= 0 ? "+" : ""}
                      {formatNumber(differenceFromAvg)} ₪ (
                      {percentFromAvg >= 0 ? "+" : ""}
                      {percentFromAvg.toFixed(1)}%)
                    </StatHelpText>
                  </Stat>
                  <Badge
                    colorScheme={todayPerformance.color}
                    fontSize="lg"
                    p={2}>
                    {todayPerformance.emoji} {todayPerformance.text}
                  </Badge>
                </Flex>
              </CardBody>
            </Card>
            {weeklyStatsFromRecords.length === 0 ? (
              <Text>
                لا توجد سجلات محفوظة. استخدم صفحة "حفظ ومقارنة" لحفظ إجمالي
                اليوم.
              </Text>
            ) : (
              <Table variant="simple" bg={bgCard} borderRadius="md">
                <Thead>
                  <Tr>
                    <Th>التاريخ</Th>
                    <Th>إجمالي المبيعات (₪)</Th>
                    <Th>التصنيف (حسب السجلات)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {weeklyStatsFromRecords.map((record, idx) => {
                    const otherRecordsAvg = (() => {
                      const others = weeklyStatsFromRecords.filter(
                        (_, i) => i !== idx,
                      );
                      if (others.length === 0) return 0;
                      const sum = others.reduce((acc, r) => acc + r.amount, 0);
                      return sum / others.length;
                    })();
                    const rating = getPerformanceRating(
                      record.amount,
                      otherRecordsAvg,
                    );
                    return (
                      <Tr key={idx}>
                        <Td>{record.date}</Td>
                        <Td>{formatNumber(record.amount)} ₪</Td>
                        <Td>
                          <Badge colorScheme={rating.color}>
                            {rating.emoji} {rating.text}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </TabPanel>

          {/* تبويب تجميع المبيعات - ثلاثة خيارات */}
          <TabPanel p={0} pt={4}>
            <Flex mb={6} gap={4} wrap="wrap">
              <Button
                colorScheme={groupingMode === "exact" ? "blue" : "gray"}
                onClick={() => {
                  setGroupingMode("exact");
                  setCustomGroups([]);
                }}>
                تجميع حسب الاسم الدقيق
              </Button>
              <Button
                colorScheme={groupingMode === "customKeyword" ? "blue" : "gray"}
                onClick={() => {
                  setGroupingMode("customKeyword");
                  setCustomGroups([]);
                }}>
                تجميع حسب كلمات مفتاحية مخصصة
              </Button>
              <Button
                colorScheme={groupingMode === "category" ? "blue" : "gray"}
                onClick={() => {
                  setGroupingMode("category");
                  setCustomGroups([]);
                }}>
                تجميع حسب الأصناف
              </Button>
            </Flex>

            {/* الاسم الدقيق */}
            {groupingMode === "exact" && (
              <>
                {exactNameGroups.length === 0 ? (
                  <Text>لا توجد مبيعات مسجلة.</Text>
                ) : (
                  <Wrap spacing={6}>
                    {exactNameGroups.map((group) => (
                      <WrapItem key={group.name}>
                        <Card
                          minW="260px"
                          bg={bgCard}
                          borderTop="4px solid"
                          borderTopColor="teal.500"
                          boxShadow="md">
                          <CardBody>
                            <Heading size="md" mb={2}>
                              {group.name}
                            </Heading>
                            <Badge mb={3} colorScheme="teal">
                              {group.displayType === "sandwich"
                                ? "صندويشة"
                                : group.displayType === "meal"
                                  ? "وجبة"
                                  : group.displayType === "single"
                                    ? "مادة مفردة"
                                    : "أنواع متعددة"}
                            </Badge>
                            <Stat mb={2}>
                              <StatLabel>إجمالي المبلغ</StatLabel>
                              <StatNumber color="teal.500">
                                {formatNumber(group.totalAmount)} ₪
                              </StatNumber>
                            </Stat>
                            <Stat mb={2}>
                              <StatLabel>الكمية المباعة</StatLabel>
                              <StatNumber>{group.totalQuantity}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>عدد الفواتير</StatLabel>
                              <StatNumber>{group.invoiceCount}</StatNumber>
                            </Stat>
                          </CardBody>
                        </Card>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </>
            )}

            {/* كلمات مفتاحية مخصصة */}
            {groupingMode === "customKeyword" && (
              <>
                <Flex mb={4} gap={2}>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="أدخل كلمات مفتاحية مفصولة بمسافات أو فواصل، مثلاً: شاورما بطاطا"
                      value={customKeywords}
                      onChange={(e) => setCustomKeywords(e.target.value)}
                    />
                  </InputGroup>
                  <Button colorScheme="blue" onClick={handleKeywordGrouping}>
                    تجميع
                  </Button>
                </Flex>
                {customGroups.length === 0 ? (
                  <Text>
                    {customKeywords.trim()
                      ? "لا توجد مبيعات تطابق الكلمات المفتاحية."
                      : "أدخل كلمات مفتاحية ثم اضغط تجميع."}
                  </Text>
                ) : (
                  <Wrap spacing={6}>
                    {customGroups.map((group) => (
                      <WrapItem key={group.keyword}>
                        <Card
                          minW="260px"
                          bg={bgCard}
                          borderTop="4px solid"
                          borderTopColor="orange.500"
                          boxShadow="md">
                          <CardBody>
                            <Heading size="md" mb={2}>
                              {group.keyword}
                            </Heading>
                            <Stat mb={2}>
                              <StatLabel>إجمالي المبلغ</StatLabel>
                              <StatNumber color="orange.500">
                                {formatNumber(group.totalAmount)} ₪
                              </StatNumber>
                            </Stat>
                            <Stat mb={2}>
                              <StatLabel>الكمية المباعة</StatLabel>
                              <StatNumber>{group.totalQuantity}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>عدد الفواتير</StatLabel>
                              <StatNumber>{group.invoiceCount}</StatNumber>
                            </Stat>
                          </CardBody>
                        </Card>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </>
            )}

            {/* تجميع حسب الأصناف */}
            {groupingMode === "category" && (
              <>
                {categoryGroups.length === 0 ? (
                  <Text>لا توجد مبيعات ضمن الأصناف.</Text>
                ) : (
                  <Wrap spacing={6}>
                    {categoryGroups.map((group) => (
                      <WrapItem key={group.categoryId}>
                        <Card
                          minW="260px"
                          bg={bgCard}
                          borderTop="4px solid"
                          borderTopColor="purple.500"
                          boxShadow="md">
                          <CardBody>
                            <Heading size="md" mb={2}>
                              {group.categoryName}
                            </Heading>
                            <Stat mb={2}>
                              <StatLabel>إجمالي المبلغ</StatLabel>
                              <StatNumber color="purple.500">
                                {formatNumber(group.totalAmount)} ₪
                              </StatNumber>
                            </Stat>
                            <Stat mb={2}>
                              <StatLabel>الكمية المباعة</StatLabel>
                              <StatNumber>{group.totalQuantity}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>عدد الفواتير</StatLabel>
                              <StatNumber>{group.invoiceCount}</StatNumber>
                            </Stat>
                          </CardBody>
                        </Card>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
