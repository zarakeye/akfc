// @tiptap/core et non @tiptap/react : ce module sert aussi au rendu SERVEUR (richTextHtml.ts), et
// @tiptap/react, marqué « use client » depuis la 3.30, ne peut pas être importé par un composant serveur.
import { mergeAttributes } from "@tiptap/core"
import TiptapHorizontalRule from "@tiptap/extension-horizontal-rule"

export const HorizontalRule = TiptapHorizontalRule.extend({
  renderHTML() {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, { "data-type": this.name }),
      ["hr"],
    ]
  },
})

export default HorizontalRule
