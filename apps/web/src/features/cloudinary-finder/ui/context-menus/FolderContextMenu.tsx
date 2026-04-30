"use client";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@components/ui/context-menu";

export function FolderContextMenu({ children}: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full">
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => console.log("Ouvrir")}>
          Ouvrir
        </ContextMenuItem>

        <ContextMenuItem onClick={() => console.log("Renommer")}>
          Renommer
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger>Partager</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copier le lien</ContextMenuItem>
            <ContextMenuItem>Envoyer par email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem className="text-red-600">
          Supprimer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
