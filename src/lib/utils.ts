import { createCn } from "cn/config";

/*
 * Class merging that knows our custom type scale (globals.css).
 * Without this, cn() treats e.g. `text-caption` as a text colour and drops it
 * when a component also sets `text-success-foreground`.
 * Always import cn from "@/lib/utils", not from "cn" directly.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display-sm", "title-lg", "title-md", "title-sm", "body-md", "body-sm", "caption"],
        },
      ],
    },
  },
});
