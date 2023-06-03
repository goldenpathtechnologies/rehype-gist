import qs from "qs";
import axios from "axios";
import parseRange from "parse-numeric-range";
import { fromHtml } from "hast-util-from-html";
import type {
  Element,
  Parent,
  Root,
  Text,
} from "hast";
import { isElement } from "hast-util-is-element";
import { visit } from "unist-util-visit";
import { classnames as cx } from "hast-util-classnames";

export type GistUri = {
  username: string;
  gistId: string;
  file?: string;
  lines?: string;
  highlights?: string;
};

export type Gist = {
  description: string;
  public: boolean;
  created_at: string;
  files: string[];
  owner: string;
  div: string;
  stylesheet: string;
};

export type RehypeGistOptions = {
  replaceParentParagraph?: boolean;
  omitCodeBlocks?: boolean;
  classNames?: string | string[];
};

const baseGistUrl = `https://gist.github.com`;

export function parseGistUri(gistUri: string): GistUri | undefined {
  if (!gistUri.startsWith(`gist:`)) return undefined;

  const uriSegments = gistUri.replace(`gist:`, ``).split(/[/?]/);

  if (uriSegments.length === 2) {
    return {
      username: uriSegments[0],
      gistId: uriSegments[1],
    } as GistUri;
  }

  if (uriSegments.length !== 3) return undefined;

  const [username, gistId, queryString] = uriSegments;
  const gistQuery = qs.parse(queryString, { comma: false });

  return {
    username,
    gistId,
    file: gistQuery.file?.toString(),
    lines: gistQuery.lines?.toString(),
    highlights: gistQuery.highlights?.toString(),
  };
}

export function convertFilenameToAttributeFormat(filename: string): string {
  return filename.replace(/^\./, ``)
    .replace(/[^a-zA-Z0-9_]+/g, `-`)
    .toLowerCase();
}

export function getGistElementFromHtml(uri: GistUri, data: Gist): Element {
  const gistHtml = data.div;
  const highlights = uri.highlights ? parseRange(uri.highlights) : [];
  const lines = uri.lines ? parseRange(uri.lines) : [];
  const hasHighlights = highlights.length > 0;
  const hasLines = lines.length > 0;
  const canProcessLinesOrHighlights = (hasLines || hasHighlights) && uri.file;
  const rootFragment: Root = fromHtml(gistHtml, { fragment: true });
  const rootElements: Element[] = rootFragment.children
    .filter((child) => isElement(child))
    .map((child) => child as Element);

  if (rootElements.length !== 1) throw new Error(`Gist doesn't exist or has invalid content`);

  const gistElement = rootElements[0];

  if (!canProcessLinesOrHighlights) return gistElement;

  const file = convertFilenameToAttributeFormat(uri.file);
  const elementIdPrefix = `file-${file}-LC`;

  visit(
    gistElement,
    (node: Element) => {
      if (!isElement(node, `tr`)) return false;

      const codeLine = node.children.find(
        (e: Element) => e.tagName === `td` && String(e.properties.id).includes(elementIdPrefix),
      );

      return codeLine !== undefined;
    },
    (node: Element, index: number, parent: Parent) => {
      const codeLine = node.children.find(
        (e: Element) => String(e.properties.id).includes(elementIdPrefix),
      );

      if (codeLine === undefined) return;

      const lineNumber = parseInt(
        String((codeLine as Element).properties.id).replace(elementIdPrefix, ``),
        10,
      );

      if (Number.isNaN(lineNumber)) return;

      if (highlights.includes(lineNumber)) {
        Object.assign(codeLine, cx(codeLine, `highlighted`));
      }

      if (lines.includes(lineNumber)) {
        parent.children.splice(index, 1);
      }
    },
    true,
  );

  return gistElement;
}

export default async function getGistElement(gistUri: string): Promise<Element> {
  const uri = parseGistUri(gistUri);

  if (!uri) throw new Error(`Failed to load Gist, incorrect URI format`);

  const gistUrl = `${baseGistUrl}/${uri.username}/${uri.gistId}.json${uri.file ? `?file=${uri.file}` : ``}`;
  const response = await axios.get(gistUrl);

  if (response.status === 400) throw new Error(`Gist not found at URL: ${gistUrl}`);
  if (response.status === 500) throw new Error(`An error occurred while requesting Gist from the server`);
  if (response.status !== 200) throw new Error(`Response not supported: ${response.status} - ${response.statusText}`);

  return getGistElementFromHtml(uri, response.data);
}

export async function convertInlineCodeToGist(
  node: Element,
  parent: Parent,
  options: RehypeGistOptions,
): Promise<void> {
  if (options.omitCodeBlocks && isElement(parent, `pre`)) return;
  // Can't replace p tag if it contains more than just our target gist element
  if (options.replaceParentParagraph && isElement(parent, `p`) && parent.children.length > 1) return;

  const gistUri = (node.children[0] as Text).value;
  const gistElement = await getGistElement(gistUri);
  const newNode: Element = cx(gistElement, options.classNames);

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
