import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from './ui/context-menu'

export function Contextmenu({ label }: { label: string }): React.JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{label}</ContextMenuTrigger>
      <ContextMenuContent className="bg-white border-0">
        <ContextMenuItem
          className="justify-center"
          onClick={() => {
            alert('clicked rename')
          }}
        >
          Rename
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
