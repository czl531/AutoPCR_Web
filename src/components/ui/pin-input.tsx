import * as React from "react"

import { PinInput as ChakraPinInput, Group } from "@chakra-ui/react"

export interface PinInputProps extends ChakraPinInput.RootProps {
  rootRef?: React.Ref<HTMLDivElement>
  count?: number
  inputProps?: ChakraPinInput.InputProps
  attached?: boolean
}

export const PinInput = React.forwardRef<HTMLInputElement, PinInputProps>(
  function PinInput(props, ref) {
    const {
      children,
      inputProps,
      rootRef,
      count = 4,
      attached,
      ...rest
    } = props

    return (
      <ChakraPinInput.Root ref={rootRef} {...rest}>
        <ChakraPinInput.HiddenInput ref={ref} {...(inputProps as any)} />
        <ChakraPinInput.Control>
          <Group attached={attached}>
            {Array.from({ length: count }).map((_, index) => (
              <ChakraPinInput.Input key={index} index={index} />
            ))}
          </Group>
        </ChakraPinInput.Control>
      </ChakraPinInput.Root>
    )
  },
)
