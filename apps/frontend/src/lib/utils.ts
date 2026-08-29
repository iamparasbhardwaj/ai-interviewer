import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Our design tokens add custom `text-*` font sizes (--text-body, --text-nav-label,
 * …). Out of the box tailwind-merge only knows Tailwind's built-in size names, so
 * it files `text-body` under the same `text-` group as the colour `text-bone-white`
 * and drops whichever comes first — silently rendering type at the browser default.
 * Registering the tokens here keeps size and colour in separate groups.
 *
 * Keep this list in sync with the `--text-*` tokens in styles/globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "caption",
            "nav-label",
            "body",
            "heading-2xs",
            "heading-xs",
            "subheading",
            "heading-sm",
            "heading",
            "heading-lg",
            "display",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
