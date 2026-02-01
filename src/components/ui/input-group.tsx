import * as React from "react"

import { Group, InputAddon } from "@chakra-ui/react"

export interface InputGroupProps extends React.ComponentProps<typeof Group> {
  startElement?: React.ReactNode
  endElement?: React.ReactNode
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const { startElement, endElement, children, ...rest } = props
    return (
      <Group attached ref={ref} {...rest}>
        {startElement && <InputAddon>{startElement}</InputAddon>}
        {children}
        {endElement && <InputAddon>{endElement}</InputAddon>}
      </Group>
    )
  },
)
