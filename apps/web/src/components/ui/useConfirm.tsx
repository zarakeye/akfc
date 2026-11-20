"use client";

import { JSX, ReactNode, useState } from "react";
import ConfirmDialog from "#components/ui/ConfirmDialog.tsx";

export type ConfirmOptions = {
  title: string;
  description: ReactNode;
  /** Texte du bouton de confirmation (« Supprimer » par défaut). */
  confirmLabel?: string;
  /** Bouton rouge (par défaut) : la plupart des confirmations précèdent une suppression. */
  destructive?: boolean;
};

/**
 * Remplace `window.confirm` par la fenêtre de confirmation du site, sans changer la forme du
 * code appelant : `if (!(await confirm({ … }))) return;`.
 *
 * `window.confirm` bloque la page, n'a ni titre ni bouton nommé, et ignore le thème. Ici, la
 * promesse reste en attente tant que la fenêtre est ouverte, puis se résout à `true`
 * (confirmé) ou `false` (annulé). Le composant affiche `dialog` quelque part dans son rendu.
 */
export function useConfirm(): {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  dialog: JSX.Element | null;
} {
  const [pending, setPending] = useState<{
    options: ConfirmOptions;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> =>
    new Promise((resolve) => setPending({ options, resolve }));

  const close = (ok: boolean): void => {
    pending?.resolve(ok);
    setPending(null);
  };

  const dialog = pending ? (
    <ConfirmDialog
      open
      title={pending.options.title}
      description={pending.options.description}
      confirmLabel={pending.options.confirmLabel ?? "Supprimer"}
      destructive={pending.options.destructive ?? true}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ) : null;

  return { confirm, dialog };
}
