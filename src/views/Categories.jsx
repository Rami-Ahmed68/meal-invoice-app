import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  HStack,
  Text,
  IconButton,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useApp } from "../context/data";

export const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const toast = useToast();

  // إضافة صنف جديد
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "الرجاء إدخال اسم الصنف",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    addCategory(newCategoryName);
    setNewCategoryName("");
    toast({ title: "تم إضافة الصنف بنجاح", status: "success", duration: 1500 });
  };

  // بدء التعديل
  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  // حفظ التعديل
  const saveEdit = () => {
    if (!editName.trim()) {
      toast({ title: "الاسم لا يمكن أن يكون فارغاً", status: "warning" });
      return;
    }
    updateCategory(editingId, editName);
    setEditingId(null);
    toast({ title: "تم تعديل الصنف", status: "success", duration: 1500 });
  };

  // حذف صنف
  const handleDelete = (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف الصنف "${name}"؟`)) {
      const success = deleteCategory(id);
      if (success) {
        toast({ title: "تم حذف الصنف", status: "info", duration: 1500 });
      } else {
        toast({
          title: "لا يمكن حذف صنف يحتوي على وجبات",
          status: "error",
          duration: 2000,
        });
      }
    }
  };

  return (
    <Box>
      <Heading mb={6}>إدارة الأصناف</Heading>

      {/* قسم إضافة صنف جديد */}
      <Card mb={8} variant="outline">
        <CardBody>
          <Heading size="md" mb={4}>
            ➕ إضافة صنف جديد
          </Heading>
          <Flex gap={4}>
            <Input
              placeholder="اسم الصنف (مثل: مشاوي, مقبلات, عصائر)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
              flex={1}
            />
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleAddCategory}>
              إضافة
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* قسم عرض جميع الأصناف */}
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            📋 جميع الأصناف
          </Heading>
          {categories.length === 0 ? (
            <Text color="gray.500" textAlign="center">
              لا توجد أصناف بعد، أضف صنفك الأول 👆
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {categories.map((cat) => (
                <Box
                  key={cat.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                  _dark={{ bg: "gray.700" }}
                  transition="all 0.2s"
                  _hover={{ shadow: "md", transform: "scale(1.01)" }}>
                  {editingId === cat.id ? (
                    // وضع التعديل
                    <Flex gap={2}>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        size="sm"
                        autoFocus
                      />
                      <Button size="sm" colorScheme="green" onClick={saveEdit}>
                        حفظ
                      </Button>
                      <Button size="sm" onClick={() => setEditingId(null)}>
                        إلغاء
                      </Button>
                    </Flex>
                  ) : (
                    // وضع العرض العادي
                    <Flex justify="space-between" align="center">
                      <Text fontSize="lg" fontWeight="medium">
                        {cat.name}
                      </Text>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => startEdit(cat)}
                          aria-label="تعديل"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          aria-label="حذف"
                        />
                      </HStack>
                    </Flex>
                  )}
                </Box>
              ))}
            </SimpleGrid>
          )}
        </CardBody>
      </Card>
    </Box>
  );
};
