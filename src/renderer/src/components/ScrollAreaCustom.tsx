import { ScrollArea } from './ui/scroll-area'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

function ScrollAreaCustom({
  className,
  children,
  removeHighlight
}: {
  className: string
  children: React.ReactNode
  removeHighlight?: () => void
} & React.ComponentProps<typeof ScrollAreaPrimitive.Root>): React.JSX.Element {
  return (
    <div className={className}>
      <ScrollArea
        removeHighlight={removeHighlight}
        type="auto"
        className={`
        h-full
        **:data-[slot=scroll-area-scrollbar]:rounded-md
        **:data-[slot=scroll-area-scrollbar]:bg-gray-300
        **:data-[slot=scroll-area-thumb]:bg-black
      `}
      >
        <div className="pr-4 divide-y divide-black min-w-0">{children}</div>
      </ScrollArea>
    </div>
  )
}

export default ScrollAreaCustom
