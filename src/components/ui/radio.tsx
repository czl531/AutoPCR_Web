import * as React from "react"

import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react"

export const RadioGroup = ChakraRadioGroup.Root

export interface RadioProps extends ChakraRadioGroup.ItemProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  rootRef?: React.Ref<HTMLDivElement>
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    const { children, inputProps, rootRef, colorPalette = "brand", ...rest } = props
    return (
      <ChakraRadioGroup.Item ref={rootRef} colorPalette={colorPalette} {...rest}>
        <ChakraRadioGroup.ItemHiddenInput ref={ref} {...inputProps} />
        <ChakraRadioGroup.ItemControl />
        {children && <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>}
      </ChakraRadioGroup.Item>
    )
  },
)
