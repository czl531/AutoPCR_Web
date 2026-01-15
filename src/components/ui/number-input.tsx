import * as React from "react"

import { NumberInput as ChakraNumberInput } from "@chakra-ui/react"

export interface NumberInputProps extends ChakraNumberInput.RootProps {}

export const NumberInput = React.forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(props, ref) {
    const { children, ...rest } = props
    return (
      <ChakraNumberInput.Root ref={ref} variant="outline" {...rest}>
        {children}
        <ChakraNumberInput.Control>
          <ChakraNumberInput.IncrementTrigger />
          <ChakraNumberInput.DecrementTrigger />
        </ChakraNumberInput.Control>
      </ChakraNumberInput.Root>
    )
  },
)

export const NumberInputField = ChakraNumberInput.Input
export const NumberInputScrubber = ChakraNumberInput.Scrubber
export const NumberInputLabel = ChakraNumberInput.Label
