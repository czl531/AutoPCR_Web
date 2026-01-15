// theme.ts

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Soft Tech Blue / Modern UI Blue (Less aggressive, more professional)
        brand: {
          50: { value: "#ECF5FF" },
          100: { value: "#D0E6FF" },
          200: { value: "#A6D0FF" },
          300: { value: "#70B0FF" },
          400: { value: "#388BF2" },
          500: { value: "#1A6CE6" }, // Softer, deep sky blue
          600: { value: "#0F52CC" },
          700: { value: "#0A3EAA" },
          800: { value: "#0A3485" },
          900: { value: "#0D2E69" },
          950: { value: "#081C42" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "#FFFFFF" }, // Always White Text
          fg: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
          muted: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.800}" } },
          emphasized: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
          focusRing: { value: "{colors.brand.500}" },
        },
        sidebar: {
          activeBg: { value: { _light: "{colors.brand.50}", _dark: "{colors.whiteAlpha.100}" } },
          activeFg: { value: { _light: "{colors.brand.800}", _dark: "{colors.brand.200}" } },
        },
        bg: {
          // Panel backgrounds (Sidebar, Cards, Navbar)
          panel: { value: { base: "#FFFFFF", _dark: "#151B2B" } }, 
          // Page background
          canvas: { value: { base: "#E2E8F0", _dark: "#0B0E14" } },
          // Muted backgrounds (Secondary areas)
          muted: { value: { base: "#EDF2F7", _dark: "#1A202C" } },
          // Glass effect for headers/overlays
          glass: { value: { base: "rgba(255, 255, 255, 0.6)", _dark: "rgba(0, 0, 0, 0.6)" } },
        }
      },
    },
  },
  globalCss: {
    body: {
      bg: "bg.canvas",
      color: {
        base: "gray.900",
        _dark: "gray.50"
      }
    },
  },
})

export const system = createSystem(defaultConfig, config)

export default system

