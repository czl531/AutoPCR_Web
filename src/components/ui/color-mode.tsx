import * as React from "react"

import { LuMoon, LuSun } from "react-icons/lu"
import { ThemeProvider, useTheme } from "next-themes"

import { IconButton } from "./icon-button"
import type { IconButtonProps } from "./icon-button"

export interface ColorModeProviderProps extends React.ComponentProps<typeof ThemeProvider> {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === 'light' ? light : dark
}

export function ColorModeButton(props: IconButtonProps) {
  const { toggleColorMode, colorMode } = useColorMode()
  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      {...props}
    >
      {colorMode === "light" ? <LuSun /> : <LuMoon />}
    </IconButton>
  )
}
