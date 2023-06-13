import type { Root } from "hast";
import { getGistTransformations, RehypeGistOptions } from "./util.js";

export default function RehypeGist(
  {
    replaceParentParagraph,
    omitCodeBlocks,
    classNames,
  }: RehypeGistOptions = {
    replaceParentParagraph: true,
    omitCodeBlocks: true,
  },
) {
  return async (tree: Root): Promise<Root> => {
    await Promise.all(getGistTransformations(tree, {
      replaceParentParagraph,
      omitCodeBlocks,
      classNames,
    }));
    return tree;
  };
}
