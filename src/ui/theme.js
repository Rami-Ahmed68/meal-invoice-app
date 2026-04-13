// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
        color: props.colorMode === "dark" ? "gray.100" : "gray.800",
      },
    }),
  },
  colors: {
    // ألوان مخصصة للاستخدام العام
    brand: {
      50: "#E3F2FD",
      100: "#BBDEFB",
      200: "#90CAF9",
      300: "#64B5F6",
      400: "#42A5F5",
      500: "#2196F3",
      600: "#1E88E5",
      700: "#1976D2",
      800: "#1565C0",
      900: "#0D47A1",
    },
    // ألوان الخلفيات
    bg: {
      light: "#ffffff",
      dark: "#1A202C",
      subtleLight: "#F7FAFC",
      subtleDark: "#2D3748",
    },
    // ألوان النصوص
    text: {
      light: "#1A202C",
      dark: "#F7FAFC",
      mutedLight: "#4A5568",
      mutedDark: "#A0AEC0",
    },
    // ألوان الحدود
    border: {
      light: "#E2E8F0",
      dark: "#4A5568",
    },
  },
  components: {
    // تخصيص الكروت (Card)
    Card: {
      baseStyle: (props) => ({
        bg: props.colorMode === "dark" ? "gray.800" : "white",
        borderColor: props.colorMode === "dark" ? "gray.700" : "gray.200",
        borderWidth: "1px",
        borderRadius: "lg",
        boxShadow: props.colorMode === "dark" ? "dark-lg" : "sm",
      }),
    },
    // تخصيص حقول الإدخال (Input)
    Input: {
      baseStyle: (props) => ({
        field: {
          bg: props.colorMode === "dark" ? "gray.700" : "white",
          borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
          color: props.colorMode === "dark" ? "white" : "gray.800",
          _placeholder: {
            color: props.colorMode === "dark" ? "gray.400" : "gray.500",
          },
          _hover: {
            borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
          },
          _focus: {
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px #3182CE",
          },
        },
      }),
    },
    // تخصيص Select (القوائم المنسدلة)
    Select: {
      baseStyle: (props) => ({
        field: {
          bg: props.colorMode === "dark" ? "gray.700" : "white",
          borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
          color: props.colorMode === "dark" ? "white" : "gray.800",
        },
      }),
    },
    // تخصيص Textarea
    Textarea: {
      baseStyle: (props) => ({
        bg: props.colorMode === "dark" ? "gray.700" : "white",
        borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      }),
    },
    // تخصيص الجداول (Table)
    Table: {
      baseStyle: (props) => ({
        th: {
          bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
          color: props.colorMode === "dark" ? "gray.100" : "gray.800",
        },
        td: {
          borderColor: props.colorMode === "dark" ? "gray.700" : "gray.200",
        },
      }),
    },
    // تخصيص الأزرار (Button) – مثال فقط
    Button: {
      baseStyle: {
        fontWeight: "medium",
        borderRadius: "md",
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === "dark" ? "blue.600" : "blue.500",
          color: "white",
          _hover: {
            bg: props.colorMode === "dark" ? "blue.500" : "blue.600",
          },
        }),
        outline: (props) => ({
          borderColor: props.colorMode === "dark" ? "blue.400" : "blue.500",
          color: props.colorMode === "dark" ? "blue.300" : "blue.600",
        }),
      },
    },
  },
  direction: "rtl",
  // أضفنا مكونات إضافية لتجربة أفضل
  semanticTokens: {
    colors: {
      "card-bg": {
        default: "white",
        _dark: "gray.800",
      },
      "input-bg": {
        default: "white",
        _dark: "gray.700",
      },
      "border-default": {
        default: "gray.200",
        _dark: "gray.700",
      },
    },
  },
});

export default theme;
