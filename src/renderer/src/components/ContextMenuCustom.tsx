import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from './ui/context-menu'

function ContextMenuCustom({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="truncate">{label}</ContextMenuTrigger>
      <ContextMenuContent className="bg-white border">{children}</ContextMenuContent>
    </ContextMenu>
  )
}

export default ContextMenuCustom
