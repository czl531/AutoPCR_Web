import { Skeleton as ChakraSkeleton, Stack } from "@chakra-ui/react"

import type { SkeletonProps as ChakraSkeletonProps } from "@chakra-ui/react"
import { forwardRef } from "react"

export interface SkeletonProps extends ChakraSkeletonProps {
  noOfLines?: number
  gap?: number
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(props, ref) {
    const { noOfLines = 1, gap = 2, ...rest } = props

    if (noOfLines > 1) {
      return (
        <Stack gap={gap} width="full" ref={ref}>
          {Array.from({ length: noOfLines }).map((_, index) => (
            <ChakraSkeleton key={index} {...rest} />
          ))}
        </Stack>
      )
    }

    return <ChakraSkeleton ref={ref} {...rest} />
  },
)

export const SkeletonCircle = forwardRef<HTMLDivElement, ChakraSkeletonProps>(
  function SkeletonCircle(props, ref) {
    return <ChakraSkeleton ref={ref} borderRadius="full" boxSize="12" {...props} />
  },
)

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonProps>(
  function SkeletonText(props, ref) {
    const { noOfLines = 3, gap = 2, ...rest } = props
    return (
      <Stack gap={gap} width="full" ref={ref}>
        {Array.from({ length: noOfLines }).map((_, index) => (
          <ChakraSkeleton
            key={index}
            height="4"
            ref={index === 0 ? ref : undefined}
            {...rest}
            width={index === noOfLines - 1 ? "80%" : "100%"}
          />
        ))}
      </Stack>
    )
  },
)
