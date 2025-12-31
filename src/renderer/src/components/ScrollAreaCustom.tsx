import { ScrollArea } from './ui/scroll-area'

export function ScrollAreaCustom({
  className,
  children
}: {
  className: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className={className}>
      <ScrollArea
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
