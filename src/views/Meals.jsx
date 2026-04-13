// src/views/Meals.jsx
import React, { useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  IconButton,
  useToast,
  Text,
  Wrap,
  WrapItem,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  RadioGroup,
  Radio,
  Stack,
  Badge,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useApp } from "../context/data";

export const Meals = () => {
  const {
    categories,
    meals,
    addMeal,
    updateMeal,
    deleteMeal,
    getCategoryName,
  } = useApp();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [newMeal, setNewMeal] = useState({
    name: "",
    categoryId: "",
    availableTypes: "both",
    singlePrice: "",
    sandwichPrice: "",
    mealPrice: "",
  });

  const [editingMeal, setEditingMeal] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: "",
    availableTypes: "both",
    singlePrice: "",
    sandwichPrice: "",
    mealPrice: "",
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const handleAddMeal = () => {
    if (!newMeal.name.trim() || !newMeal.categoryId) {
      toast({
        title: "خطأ",
        description: "الاسم والصنف مطلوبان",
        status: "error",
      });
      return;
    }
    if (newMeal.availableTypes === "single" && !newMeal.singlePrice) {
      toast({
        title: "خطأ",
        description: "السعر مطلوب للمادة المفردة",
        status: "error",
      });
      return;
    }
    if (newMeal.availableTypes === "sandwich_only" && !newMeal.sandwichPrice) {
      toast({
        title: "خطأ",
        description: "سعر الصندويشة مطلوب",
        status: "error",
      });
      return;
    }
    if (newMeal.availableTypes === "meal_only" && !newMeal.mealPrice) {
      toast({ title: "خطأ", description: "سعر الوجبة مطلوب", status: "error" });
      return;
    }
    if (
      newMeal.availableTypes === "both" &&
      !newMeal.sandwichPrice &&
      !newMeal.mealPrice
    ) {
      toast({
        title: "خطأ",
        description: "يجب إدخال سعر للصندويشة أو الوجبة",
        status: "error",
      });
      return;
    }

    addMeal({
      name: newMeal.name.trim(),
      categoryId: parseInt(newMeal.categoryId),
      availableTypes: newMeal.availableTypes,
      singlePrice:
        newMeal.availableTypes === "single"
          ? parseFloat(newMeal.singlePrice)
          : null,
      sandwichPrice:
        newMeal.availableTypes === "sandwich_only" ||
        newMeal.availableTypes === "both"
          ? parseFloat(newMeal.sandwichPrice)
          : null,
      mealPrice:
        newMeal.availableTypes === "meal_only" ||
        newMeal.availableTypes === "both"
          ? parseFloat(newMeal.mealPrice)
          : null,
    });
    setNewMeal({
      name: "",
      categoryId: "",
      availableTypes: "both",
      singlePrice: "",
      sandwichPrice: "",
      mealPrice: "",
    });
    toast({ title: "تمت الإضافة", status: "success" });
  };

  const openEditModal = (meal) => {
    setEditingMeal(meal);
    setEditForm({
      name: meal.name,
      categoryId: meal.categoryId,
      availableTypes: meal.availableTypes || "both",
      singlePrice: meal.singlePrice || "",
      sandwichPrice: meal.sandwichPrice || "",
      mealPrice: meal.mealPrice || "",
    });
    onOpen();
  };

  const handleUpdateMeal = () => {
    if (!editForm.name.trim() || !editForm.categoryId) {
      toast({
        title: "خطأ",
        description: "الاسم والصنف مطلوبان",
        status: "error",
      });
      return;
    }
    if (editForm.availableTypes === "single" && !editForm.singlePrice) {
      toast({ title: "خطأ", description: "السعر مطلوب", status: "error" });
      return;
    }
    if (
      editForm.availableTypes === "sandwich_only" &&
      !editForm.sandwichPrice
    ) {
      toast({
        title: "خطأ",
        description: "سعر الصندويشة مطلوب",
        status: "error",
      });
      return;
    }
    if (editForm.availableTypes === "meal_only" && !editForm.mealPrice) {
      toast({ title: "خطأ", description: "سعر الوجبة مطلوب", status: "error" });
      return;
    }

    updateMeal(editingMeal.id, {
      name: editForm.name.trim(),
      categoryId: parseInt(editForm.categoryId),
      availableTypes: editForm.availableTypes,
      singlePrice:
        editForm.availableTypes === "single"
          ? parseFloat(editForm.singlePrice)
          : null,
      sandwichPrice:
        editForm.availableTypes === "sandwich_only" ||
        editForm.availableTypes === "both"
          ? parseFloat(editForm.sandwichPrice)
          : null,
      mealPrice:
        editForm.availableTypes === "meal_only" ||
        editForm.availableTypes === "both"
          ? parseFloat(editForm.mealPrice)
          : null,
    });
    onClose();
    setEditingMeal(null);
    toast({ title: "تم التحديث", status: "success" });
  };

  const handleDeleteMeal = (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف المادة "${name}"؟`)) {
      deleteMeal(id);
      toast({ title: "تم الحذف", status: "info" });
    }
  };

  const filteredMeals =
    selectedCategoryId === "all"
      ? meals
      : meals.filter(
          (meal) => meal.categoryId === parseInt(selectedCategoryId),
        );

  const getTypeText = (type) => {
    switch (type) {
      case "single":
        return "مادة مفردة";
      case "sandwich_only":
        return "صندويشة فقط";
      case "meal_only":
        return "وجبة فقط";
      default:
        return "كلاهما";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "single":
        return "purple";
      case "sandwich_only":
        return "orange";
      case "meal_only":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <Box>
      <Heading mb={6}>إدارة المواد</Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* العمود الأيسر: إضافة وتصفية */}
        <VStack spacing={6} align="stretch">
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                ➕ إضافة مادة جديدة
              </Heading>
              <VStack spacing={3}>
                <FormControl isRequired>
                  <FormLabel>اسم المادة</FormLabel>
                  <Input
                    placeholder="مثال: شاورما دجاج / كولا"
                    value={newMeal.name}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, name: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>الصنف</FormLabel>
                  <Select
                    placeholder="اختر الصنف"
                    value={newMeal.categoryId}
                    onChange={(e) =>
                      setNewMeal({ ...newMeal, categoryId: e.target.value })
                    }>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>نوع المادة (كيف تباع؟)</FormLabel>
                  <RadioGroup
                    onChange={(val) =>
                      setNewMeal({ ...newMeal, availableTypes: val })
                    }
                    value={newMeal.availableTypes}>
                    <Stack direction="row" wrap="wrap">
                      <Radio value="single">مادة مفردة (بدون خيارات)</Radio>
                      <Radio value="sandwich_only">صندويشة فقط</Radio>
                      <Radio value="meal_only">وجبة كاملة فقط</Radio>
                      <Radio value="both">كلاهما (صندويشة ووجبة)</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {newMeal.availableTypes === "single" && (
                  <FormControl>
                    <FormLabel>السعر (₪)</FormLabel>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="السعر"
                      value={newMeal.singlePrice}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, singlePrice: e.target.value })
                      }
                    />
                  </FormControl>
                )}

                {(newMeal.availableTypes === "sandwich_only" ||
                  newMeal.availableTypes === "both") && (
                  <FormControl>
                    <FormLabel>سعر الصندويشة (₪)</FormLabel>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="سعر الصندويشة"
                      value={newMeal.sandwichPrice}
                      onChange={(e) =>
                        setNewMeal({
                          ...newMeal,
                          sandwichPrice: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                )}
                {(newMeal.availableTypes === "meal_only" ||
                  newMeal.availableTypes === "both") && (
                  <FormControl>
                    <FormLabel>سعر الوجبة الكاملة (₪)</FormLabel>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="سعر الوجبة"
                      value={newMeal.mealPrice}
                      onChange={(e) =>
                        setNewMeal({ ...newMeal, mealPrice: e.target.value })
                      }
                    />
                  </FormControl>
                )}
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={handleAddMeal}
                  w="full">
                  إضافة المادة
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                🏷️ تصفية حسب الصنف
              </Heading>
              <Wrap spacing={3}>
                <WrapItem>
                  <Tag
                    size="lg"
                    cursor="pointer"
                    colorScheme={selectedCategoryId === "all" ? "blue" : "gray"}
                    onClick={() => setSelectedCategoryId("all")}>
                    الكل ({meals.length})
                  </Tag>
                </WrapItem>
                {categories.map((cat) => {
                  const count = meals.filter(
                    (m) => m.categoryId === cat.id,
                  ).length;
                  return (
                    <WrapItem key={cat.id}>
                      <Tag
                        size="lg"
                        cursor="pointer"
                        colorScheme={
                          selectedCategoryId === cat.id ? "blue" : "gray"
                        }
                        onClick={() => setSelectedCategoryId(cat.id)}>
                        {cat.name} ({count})
                      </Tag>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </CardBody>
          </Card>
        </VStack>

        {/* العمود الأيمن: عرض المواد على شكل بطاقات */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              📋 قائمة المواد
            </Heading>
            {filteredMeals.length === 0 ? (
              <Text color="gray.500" textAlign="center">
                لا توجد مواد في هذا الصنف
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {filteredMeals.map((meal) => (
                  <Card
                    key={meal.id}
                    variant="outline"
                    borderWidth="1px"
                    borderRadius="lg"
                    _hover={{ shadow: "md", transform: "scale(1.01)" }}
                    transition="all 0.2s">
                    <CardBody>
                      <Flex justify="space-between" align="start" mb={2}>
                        <Heading size="sm" fontWeight="bold">
                          {meal.name}
                        </Heading>
                        <Badge colorScheme={getTypeColor(meal.availableTypes)}>
                          {getTypeText(meal.availableTypes)}
                        </Badge>
                      </Flex>
                      <Divider my={2} />
                      <VStack align="stretch" spacing={1} mb={3}>
                        {meal.availableTypes === "single" && (
                          <Text fontSize="md">
                            <strong>السعر:</strong> {meal.singlePrice} ₪
                          </Text>
                        )}
                        {(meal.availableTypes === "sandwich_only" ||
                          meal.availableTypes === "both") && (
                          <Text fontSize="md">
                            <strong>صندويشة:</strong> {meal.sandwichPrice} ₪
                          </Text>
                        )}
                        {(meal.availableTypes === "meal_only" ||
                          meal.availableTypes === "both") && (
                          <Text fontSize="md">
                            <strong>وجبة كاملة:</strong> {meal.mealPrice} ₪
                          </Text>
                        )}
                        <Text fontSize="sm" color="gray.500">
                          الصنف: {getCategoryName(meal.categoryId)}
                        </Text>
                      </VStack>
                      <HStack justify="flex-end" spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => openEditModal(meal)}
                          aria-label="تعديل"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteMeal(meal.id, meal.name)}
                          aria-label="حذف"
                        />
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Modal التعديل (نفسه) */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>تعديل المادة</ModalHeader>
          <ModalBody>
            <VStack spacing={3}>
              <FormControl>
                <FormLabel>الاسم</FormLabel>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>الصنف</FormLabel>
                <Select
                  value={editForm.categoryId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, categoryId: e.target.value })
                  }>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>نوع المادة</FormLabel>
                <RadioGroup
                  onChange={(val) =>
                    setEditForm({ ...editForm, availableTypes: val })
                  }
                  value={editForm.availableTypes}>
                  <Stack direction="row" wrap="wrap">
                    <Radio value="single">مادة مفردة</Radio>
                    <Radio value="sandwich_only">صندويشة فقط</Radio>
                    <Radio value="meal_only">وجبة فقط</Radio>
                    <Radio value="both">كلاهما</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {editForm.availableTypes === "single" && (
                <FormControl>
                  <FormLabel>السعر</FormLabel>
                  <Input
                    type="number"
                    step="0.5"
                    value={editForm.singlePrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, singlePrice: e.target.value })
                    }
                  />
                </FormControl>
              )}
              {(editForm.availableTypes === "sandwich_only" ||
                editForm.availableTypes === "both") && (
                <FormControl>
                  <FormLabel>سعر الصندويشة</FormLabel>
                  <Input
                    type="number"
                    step="0.5"
                    value={editForm.sandwichPrice}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        sandwichPrice: e.target.value,
                      })
                    }
                  />
                </FormControl>
              )}
              {(editForm.availableTypes === "meal_only" ||
                editForm.availableTypes === "both") && (
                <FormControl>
                  <FormLabel>سعر الوجبة</FormLabel>
                  <Input
                    type="number"
                    step="0.5"
                    value={editForm.mealPrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, mealPrice: e.target.value })
                    }
                  />
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdateMeal}>
              حفظ
            </Button>
            <Button variant="ghost" onClick={onClose}>
              إلغاء
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
