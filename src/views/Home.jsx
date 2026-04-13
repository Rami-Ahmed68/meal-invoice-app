// src/views/Home.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Card,
  CardBody,
  VStack,
  // HStack, // تم حذفه لأنه غير مستخدم
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  useToast,
  Badge,
  Flex,
  Wrap,
  WrapItem,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useApp } from "../context/data";

export const Home = () => {
  const { categories, meals, addInvoice } = useApp();
  const toast = useToast();

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState("");
  const [mealType, setMealType] = useState("sandwich");

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    const number = typeof num === "number" ? num : parseFloat(num);
    if (isNaN(number)) return "0";
    return number.toLocaleString("en-US").replace(/,/g, ".");
  };

  // تحديث السعر ونوع الوجبة تلقائياً عند اختيار وجبة جديدة
  useEffect(() => {
    if (!selectedMeal) return;

    let defaultType = "sandwich";
    let defaultPrice = null;

    if (selectedMeal.availableTypes === "single") {
      defaultType = "single";
      defaultPrice = selectedMeal.singlePrice;
    } else if (selectedMeal.availableTypes === "sandwich_only") {
      defaultType = "sandwich";
      defaultPrice = selectedMeal.sandwichPrice;
    } else if (selectedMeal.availableTypes === "meal_only") {
      defaultType = "meal";
      defaultPrice = selectedMeal.mealPrice;
    } else if (selectedMeal.availableTypes === "both") {
      defaultType = mealType; // نستخدم القيمة الحالية (sandwich/meal)
      defaultPrice =
        defaultType === "sandwich"
          ? selectedMeal.sandwichPrice
          : selectedMeal.mealPrice;
    }

    setMealType(defaultType);
    setCustomPrice(
      defaultPrice !== undefined && defaultPrice !== null
        ? defaultPrice.toString()
        : "",
    );
  }, [selectedMeal, mealType]); // ✅ تمت إضافة mealType

  // تحديث السعر عند تغيير نوع الوجبة (للحالة both فقط)
  useEffect(() => {
    if (selectedMeal && selectedMeal.availableTypes === "both") {
      const price =
        mealType === "sandwich"
          ? selectedMeal.sandwichPrice
          : selectedMeal.mealPrice;
      setCustomPrice(
        price !== undefined && price !== null ? price.toString() : "",
      );
    }
  }, [mealType, selectedMeal]);

  const filteredMeals = selectedCategoryId
    ? meals.filter((meal) => meal.categoryId === selectedCategoryId)
    : [];

  const handleSelectMeal = (meal) => {
    setSelectedMeal(meal);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedMeal) {
      toast({ title: "اختر وجبة أولاً", status: "warning" });
      return;
    }
    const price = parseFloat(customPrice);
    if (isNaN(price) || price <= 0) {
      toast({ title: "السعر غير صحيح", status: "error" });
      return;
    }
    const item = {
      id: Date.now(),
      mealId: selectedMeal.id,
      mealName: selectedMeal.name,
      type: mealType,
      price: price,
      quantity: quantity,
      total: price * quantity,
    };
    setCart([...cart, item]);
    setSelectedMeal(null);
    setQuantity(1);
    setCustomPrice("");
    setMealType("sandwich");
    toast({ title: "تمت الإضافة", status: "success" });
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  const finalizeInvoice = () => {
    if (cart.length === 0) {
      toast({ title: "السلة فارغة", status: "warning" });
      return;
    }
    addInvoice({ items: cart, total: totalAmount });
    setCart([]);
    toast({ title: "تم إصدار الفاتورة بنجاح", status: "success" });
  };

  const getDisplayPrice = (meal) => {
    if (meal.availableTypes === "single") {
      return `${formatNumber(meal.singlePrice)} ₪`;
    } else if (meal.availableTypes === "sandwich_only") {
      return `${formatNumber(meal.sandwichPrice)} ₪ (صندويشة)`;
    } else if (meal.availableTypes === "meal_only") {
      return `${formatNumber(meal.mealPrice)} ₪ (وجبة)`;
    } else if (meal.availableTypes === "both") {
      return `${formatNumber(meal.sandwichPrice)} / ${formatNumber(meal.mealPrice)} ₪`;
    }
    return "سعر غير محدد";
  };

  const columnHeight = "calc(100vh - 120px)";

  return (
    <Box>
      {/* كرت تعديل السعر والكمية - يظهر فقط عند اختيار وجبة */}
      {selectedMeal && (
        <Card
          mt={6}
          borderWidth="2px"
          borderColor="blue.200"
          bg="blue.50"
          mb={6}
          _dark={{ bg: "blue.900" }}>
          <CardBody>
            <Text fontWeight="bold" mb={3}>
              تعديل السعر والكمية لـ {selectedMeal.name}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
              {selectedMeal.availableTypes === "both" && (
                <Box>
                  <Text mb={2}>نوع الوجبة:</Text>
                  <RadioGroup onChange={setMealType} value={mealType}>
                    <Stack direction="row">
                      <Radio value="sandwich">صندويشة</Radio>
                      <Radio value="meal">وجبة كاملة</Radio>
                    </Stack>
                  </RadioGroup>
                </Box>
              )}
              <Box>
                <Text mb={2}>السعر (₪):</Text>
                <NumberInput
                  value={customPrice}
                  onChange={(v) => setCustomPrice(v)}
                  min={0}
                  step={0.5}>
                  <NumberInputField textAlign="center" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {selectedMeal.availableTypes === "single" &&
                    `السعر: ${formatNumber(selectedMeal.singlePrice)} ₪`}
                  {selectedMeal.availableTypes === "sandwich_only" &&
                    `السعر الافتراضي للصندويشة: ${formatNumber(selectedMeal.sandwichPrice)} ₪`}
                  {selectedMeal.availableTypes === "meal_only" &&
                    `السعر الافتراضي للوجبة: ${formatNumber(selectedMeal.mealPrice)} ₪`}
                  {selectedMeal.availableTypes === "both" &&
                    (mealType === "sandwich"
                      ? `السعر الافتراضي للصندويشة: ${formatNumber(selectedMeal.sandwichPrice)} ₪`
                      : `السعر الافتراضي للوجبة: ${formatNumber(selectedMeal.mealPrice)} ₪`)}
                </Text>
              </Box>
              <Box>
                <Text mb={2}>الكمية:</Text>
                <NumberInput
                  value={quantity}
                  onChange={(_, val) => setQuantity(val)}
                  min={1}
                  step={1}>
                  <NumberInputField textAlign="center" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                onClick={addToCart}
                alignSelf="flex-end">
                أضف إلى السلة
              </Button>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* الأعمدة الثلاثة */}
      <Flex direction={{ base: "column", lg: "row" }} gap={6}>
        {/* العمود 1: الأصناف */}
        <Box
          w={{ base: "100%", lg: "260px" }}
          bg="card-bg"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border-default"
          p={4}
          h={columnHeight}
          overflowY="auto">
          <Text fontWeight="bold" mb={4} textAlign="center">
            📂 الأصناف
          </Text>
          <VStack spacing={2} align="stretch">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "solid" : "outline"}
                colorScheme={selectedCategoryId === cat.id ? "blue" : "gray"}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setSelectedMeal(null);
                }}
                justifyContent="flex-start"
                leftIcon={<span>📁</span>}>
                {cat.name}
              </Button>
            ))}
            {categories.length === 0 && (
              <Text color="gray.500" textAlign="center">
                لا توجد أصناف
              </Text>
            )}
          </VStack>
        </Box>

        {/* العمود 2: الوجبات المتاحة */}
        <Box flex="2" h={columnHeight} overflowY="auto">
          {selectedCategoryId ? (
            <Card h="full">
              <CardBody>
                <Text fontWeight="bold" mb={4}>
                  🍽️ الوجبات المتاحة
                </Text>
                {filteredMeals.length === 0 ? (
                  <Text color="gray.500">لا توجد وجبات في هذا الصنف</Text>
                ) : (
                  <Wrap spacing={3}>
                    {filteredMeals.map((meal) => (
                      <WrapItem key={meal.id}>
                        <Button
                          variant={
                            selectedMeal?.id === meal.id ? "solid" : "outline"
                          }
                          colorScheme={
                            selectedMeal?.id === meal.id ? "green" : "blue"
                          }
                          onClick={() => handleSelectMeal(meal)}
                          size="lg">
                          {meal.name} ({getDisplayPrice(meal)})
                        </Button>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </CardBody>
            </Card>
          ) : (
            <Card h="full" bg="gray.50" _dark={{ bg: "gray.700" }}>
              <CardBody textAlign="center">
                <Text>👈 اختر صنفاً من القائمة لعرض الوجبات</Text>
              </CardBody>
            </Card>
          )}
        </Box>

        {/* العمود 3: سلة الفاتورة */}
        <Box
          w={{ base: "100%", lg: "360px" }}
          bg="card-bg"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="border-default"
          p={4}
          h={columnHeight}
          overflowY="auto">
          <Text fontWeight="bold" mb={4} textAlign="center">
            🧾 سلة الفاتورة
          </Text>
          {cart.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              السلة فارغة
            </Text>
          ) : (
            <>
              <VStack spacing={3} align="stretch">
                {cart.map((item) => (
                  <Box
                    key={item.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="border-default">
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold">{item.mealName}</Text>
                        <Badge
                          colorScheme={
                            item.type === "meal"
                              ? "green"
                              : item.type === "sandwich"
                                ? "orange"
                                : "purple"
                          }
                          mt={1}>
                          {item.type === "meal"
                            ? "وجبة"
                            : item.type === "sandwich"
                              ? "صندويشة"
                              : "مادة مفردة"}
                        </Badge>
                        <Text fontSize="sm">
                          {item.quantity} × {formatNumber(item.price)} ={" "}
                          {formatNumber(item.total)} ₪
                        </Text>
                      </Box>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="حذف"
                      />
                    </Flex>
                  </Box>
                ))}
              </VStack>
              <Divider my={4} />
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="bold" fontSize="lg">
                  الإجمالي:
                </Text>
                <Text fontWeight="bold" fontSize="xl" color="blue.500">
                  {formatNumber(totalAmount)} ₪
                </Text>
              </Flex>
              <Button
                colorScheme="green"
                w="full"
                size="lg"
                onClick={finalizeInvoice}>
                إصدار الفاتورة 💳
              </Button>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
