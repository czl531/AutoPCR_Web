import { Button, ButtonProps } from "@chakra-ui/react"

import { forwardRef } from "react"

export interface IconButtonProps extends ButtonProps {
  "aria-label": string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    return <Button padding={0} ref={ref} {...props} />
  }
)
