// src/contexts/AppContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const STORAGE_KEYS = {
  CATEGORIES: "meal_categories",
  MEALS: "meals",
  INVOICES: "invoices",
  WEEKLY_RECORDS: "weekly_sales_records",
};

export const AppProvider = ({ children }) => {
  // ---------- الحالة الأساسية ----------
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ---------- حالة الفلترة للعرض ----------
  const [filterCategoryId, setFilterCategoryId] = useState("all");
  const [searchMealTerm, setSearchMealTerm] = useState("");
  const [filterMealType, setFilterMealType] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // ---------- سجل الأيام السبعة ----------
  const [weeklyRecords, setWeeklyRecords] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.WEEKLY_RECORDS);
    return stored ? JSON.parse(stored) : [];
  });

  // ---------- تحميل البيانات من localStorage ----------
  useEffect(() => {
    try {
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const storedMeals = localStorage.getItem(STORAGE_KEYS.MEALS);
      const storedInvoices = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (storedCategories) setCategories(JSON.parse(storedCategories));
      if (storedMeals) setMeals(JSON.parse(storedMeals));
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // حفظ البيانات في localStorage
  useEffect(() => {
    if (isLoaded)
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded)
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }, [meals, isLoaded]);

  useEffect(() => {
    if (isLoaded)
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices, isLoaded]);

  useEffect(() => {
    if (isLoaded)
      localStorage.setItem(
        STORAGE_KEYS.WEEKLY_RECORDS,
        JSON.stringify(weeklyRecords),
      );
  }, [weeklyRecords, isLoaded]);

  // ---------- دوال الأصناف ----------
  const addCategory = useCallback((name) => {
    if (!name?.trim()) return;
    setCategories((prev) => [...prev, { id: Date.now(), name: name.trim() }]);
  }, []);

  const updateCategory = useCallback((id, newName) => {
    if (!newName?.trim()) return;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, name: newName.trim() } : cat,
      ),
    );
  }, []);

  const deleteCategory = useCallback(
    (id) => {
      if (meals.some((meal) => meal.categoryId === id)) {
        alert("لا يمكن حذف الصنف لأنه يحتوي على وجبات.");
        return false;
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      return true;
    },
    [meals],
  );

  // ---------- دوال الوجبات ----------
  const addMeal = useCallback(
    ({
      name,
      categoryId,
      availableTypes,
      sandwichPrice,
      mealPrice,
      singlePrice,
    }) => {
      if (!name?.trim() || !categoryId) return;
      const newMeal = {
        id: Date.now(),
        name: name.trim(),
        categoryId: Number(categoryId),
        availableTypes,
        singlePrice: singlePrice ? Number(singlePrice) : null,
        sandwichPrice: sandwichPrice ? Number(sandwichPrice) : null,
        mealPrice: mealPrice ? Number(mealPrice) : null,
      };
      setMeals((prev) => [...prev, newMeal]);
    },
    [],
  );

  const updateMeal = useCallback((id, updatedData) => {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === id ? { ...meal, ...updatedData } : meal)),
    );
  }, []);

  const deleteMeal = useCallback((id) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  }, []);

  // ---------- دوال المبيعات ----------
  const addInvoice = useCallback((invoice) => {
    const newInvoice = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...invoice,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  }, []);

  const resetDailySales = useCallback(() => {
    const today = new Date().toDateString();
    const remaining = invoices.filter(
      (inv) => new Date(inv.date).toDateString() !== today,
    );
    setInvoices(remaining);
    return remaining.length;
  }, [invoices]);

  const resetAllSales = useCallback(() => {
    if (window.confirm("هل أنت متأكد من حذف جميع الفواتير نهائياً؟")) {
      setInvoices([]);
    }
  }, []);

  // ---------- إحصائيات المبيعات ----------
  const getTotalSalesToday = useCallback(() => {
    const today = new Date().toDateString();
    return invoices
      .filter((inv) => new Date(inv.date).toDateString() === today)
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices]);

  const getTotalSalesInRange = useCallback(
    (start, end) => {
      return invoices
        .filter((inv) => {
          const invDate = new Date(inv.date);
          return invDate >= start && invDate <= end;
        })
        .reduce((sum, inv) => sum + inv.total, 0);
    },
    [invoices],
  );

  // ---------- تجميع المبيعات حسب السعر (للتقرير) ----------
  const getAggregatedSalesByMeal = useCallback(
    (startDate = null, endDate = null) => {
      let filteredInvoices = [...invoices];
      if (startDate)
        filteredInvoices = filteredInvoices.filter(
          (inv) => new Date(inv.date) >= startDate,
        );
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filteredInvoices = filteredInvoices.filter(
          (inv) => new Date(inv.date) <= end,
        );
      }
      const map = new Map();
      for (const inv of filteredInvoices) {
        if (!inv.items) continue;
        for (const item of inv.items) {
          const key = `${item.mealId}_${item.type}_${item.price}`;
          if (!map.has(key)) {
            map.set(key, {
              mealId: item.mealId,
              mealName: item.mealName,
              type: item.type,
              price: item.price,
              totalQuantity: 0,
              totalAmount: 0,
              saleCount: 0,
            });
          }
          const entry = map.get(key);
          entry.totalQuantity += item.quantity;
          entry.totalAmount += item.total;
          entry.saleCount += 1;
        }
      }
      return Array.from(map.values()).sort(
        (a, b) => b.totalQuantity - a.totalQuantity,
      );
    },
    [invoices],
  );

  // ---------- دوال مساعدة ----------
  const getCategoryName = useCallback(
    (id) => categories.find((c) => c.id === id)?.name || "غير محدد",
    [categories],
  );
  const getMealById = useCallback(
    (id) => meals.find((m) => m.id === id),
    [meals],
  );

  // ---------- دوال النسخ الاحتياطي ----------
  const exportData = useCallback(() => {
    const allData = { categories, meals, invoices, weeklyRecords };
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [categories, meals, invoices, weeklyRecords]);

  const importData = useCallback((jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.categories) setCategories(data.categories);
      if (data.meals) setMeals(data.meals);
      if (data.invoices) setInvoices(data.invoices);
      if (data.weeklyRecords) setWeeklyRecords(data.weeklyRecords);
      alert("تم استيراد البيانات بنجاح");
    } catch (error) {
      alert("خطأ في استيراد البيانات: " + error.message);
    }
  }, []);

  // ---------- حفظ اليوم في السجل الأسبوعي (مع منع التكرار) ----------
  const saveTodayRecord = useCallback(() => {
    const todayTotal = getTotalSalesToday();
    const today = new Date().toISOString().slice(0, 10);

    // البحث عن سجل موجود لليوم
    const existingIndex = weeklyRecords.findIndex(
      (record) => record.date === today,
    );
    if (existingIndex !== -1) {
      const confirmUpdate = window.confirm(
        `يوجد سجل لليوم (${today}) بالفعل بمبلغ ${weeklyRecords[existingIndex].amount} ₪.\nهل تريد تحديثه بالمبلغ الجديد (${todayTotal} ₪)؟`,
      );
      if (!confirmUpdate) return;

      // تحديث السجل الموجود: حساب الكلمة المفتاحية بناءً على الأيام الأخرى
      const otherRecords = weeklyRecords.filter(
        (_, idx) => idx !== existingIndex,
      );
      let average = 0;
      if (otherRecords.length > 0) {
        const sum = otherRecords.reduce((acc, rec) => acc + rec.amount, 0);
        average = sum / otherRecords.length;
      }
      let keyword = "";
      if (average === 0) {
        keyword = todayTotal === 0 ? "لا مبيعات" : "جيد";
      } else {
        const ratio = todayTotal / average;
        if (ratio >= 1.5) keyword = "قوي جداً";
        else if (ratio >= 1.2) keyword = "قوي";
        else if (ratio >= 0.9) keyword = "جيد";
        else if (ratio >= 0.6) keyword = "مقبول";
        else keyword = "ضعيف";
      }
      const updatedRecords = [...weeklyRecords];
      updatedRecords[existingIndex] = {
        date: today,
        amount: todayTotal,
        keyword,
      };
      setWeeklyRecords(updatedRecords);
      return;
    }

    // إذا لم يكن اليوم مسجلاً، نضيف سجلاً جديداً (مع الاحتفاظ بآخر 7 أيام)
    let average = 0;
    if (weeklyRecords.length > 0) {
      const sum = weeklyRecords.reduce((acc, rec) => acc + rec.amount, 0);
      average = sum / weeklyRecords.length;
    }
    let keyword = "";
    if (average === 0) {
      keyword = todayTotal === 0 ? "لا مبيعات" : "جيد";
    } else {
      const ratio = todayTotal / average;
      if (ratio >= 1.5) keyword = "قوي جداً";
      else if (ratio >= 1.2) keyword = "قوي";
      else if (ratio >= 0.9) keyword = "جيد";
      else if (ratio >= 0.6) keyword = "مقبول";
      else keyword = "ضعيف";
    }
    const newRecord = { date: today, amount: todayTotal, keyword };
    let updatedRecords = [newRecord, ...weeklyRecords];
    if (updatedRecords.length > 7) updatedRecords = updatedRecords.slice(0, 7);
    setWeeklyRecords(updatedRecords);
  }, [getTotalSalesToday, weeklyRecords]);

  // دالة مساعدة للتحقق من وجود سجل لليوم الحالي
  const isTodayRecordSaved = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    return weeklyRecords.some((record) => record.date === today);
  }, [weeklyRecords]);

  if (!isLoaded) return null;

  return (
    <AppContext.Provider
      value={{
        categories,
        meals,
        invoices,
        addCategory,
        updateCategory,
        deleteCategory,
        addMeal,
        updateMeal,
        deleteMeal,
        addInvoice,
        resetDailySales,
        resetAllSales,
        filterCategoryId,
        setFilterCategoryId,
        searchMealTerm,
        setSearchMealTerm,
        filterMealType,
        setFilterMealType,
        dateRange,
        setDateRange,
        getFilteredMeals: () => {
          let filtered = [...meals];
          if (filterCategoryId !== "all")
            filtered = filtered.filter(
              (m) => m.categoryId === Number(filterCategoryId),
            );
          if (filterMealType !== "all")
            filtered = filtered.filter((m) => m.type === filterMealType);
          if (searchMealTerm.trim())
            filtered = filtered.filter((m) =>
              m.name
                .toLowerCase()
                .includes(searchMealTerm.trim().toLowerCase()),
            );
          return filtered;
        },
        getFilteredInvoices: () => {
          let filtered = [...invoices];
          if (dateRange.start)
            filtered = filtered.filter(
              (inv) => new Date(inv.date) >= dateRange.start,
            );
          if (dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter((inv) => new Date(inv.date) <= end);
          }
          return filtered;
        },
        getTotalSalesToday,
        getTotalSalesInRange,
        getCategoryName,
        getMealById,
        getAggregatedSalesByMeal,
        exportData,
        importData,
        weeklyRecords,
        saveTodayRecord,
        isTodayRecordSaved,
        resetAllInvoices: resetAllSales,
      }}>
      {children}
    </AppContext.Provider>
  );
};
