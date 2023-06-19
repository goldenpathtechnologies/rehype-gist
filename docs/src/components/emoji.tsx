/* eslint-disable react/jsx-props-no-spreading */
import type { ComponentProps, ReactElement } from "react";

type EmojiProps = ComponentProps<`span`>;

export default function Emoji({ className, ...props }: EmojiProps): ReactElement {
  return <span className={`font-emoji ${className ?? ``}`} {...props} />;
}
