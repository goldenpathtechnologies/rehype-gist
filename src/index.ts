import { visit } from "unist-util-visit";
import { classnames as cx } from "hast-util-classnames";
import { isElement } from "hast-util-is-element";
import type {
  Root,
  Parent,
  Element,
  Text,
} from "hast";
import { fromHtml } from "hast-util-from-html";
import getGistHtml from "./util";

export type RehypeGistOptions = {
  replaceParentParagraph?: boolean;
  omitCodeBlocks?: boolean;
  classNames?: string | string[];
};

export async function convertInlineCodeToGist(
  node: Element,
  parent: Parent,
  options: RehypeGistOptions,
): Promise<void> {
  if (options.omitCodeBlocks && isElement(parent, `pre`)) return;
  // Can't replace p tag if it contains more than just our target gist element
  if (options.replaceParentParagraph && isElement(parent, `p`) && parent.children.length > 1) return;

  const gistUri = (node.children[0] as Text).value;
  const gistHtml = await getGistHtml(gistUri);
  const rootFragment: Root = fromHtml(gistHtml, { fragment: true });
  const rootElements: Element[] = rootFragment.children
    .filter((child) => isElement(child))
    .map((child) => child as Element);

  if (rootElements.length !== 1) throw new Error(`Gist doesn't exist or has invalid content`);

  const newNode: Element = cx(rootElements[0] as Element, options.classNames);

  if (options.replaceParentParagraph && isElement(parent) && isElement(parent, `p`)) {
    Object.assign(parent, newNode);
  } else {
    Object.assign(node, newNode);
  }
}

export function isValidGist(node: Element): boolean {
  return isElement(node, `code`)
  && node.children.length === 1
  && node.children[0].type === `text`
  && node.children[0].value.startsWith(`gist:`);
}

export function getGistTransformations(tree: Root, options: RehypeGistOptions): Promise<void>[] {
  const transformations: Promise<void>[] = [];
  visit(
    tree,
    isValidGist,
    (node: Element, _, parent: Parent) => {
      transformations.push(
        convertInlineCodeToGist(node, parent, options),
      );
    },
  );

  return transformations;
}

export default function RemarkGist(
  {
    replaceParentParagraph = true,
    omitCodeBlocks = true,
    classNames,
  }: RehypeGistOptions,
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
