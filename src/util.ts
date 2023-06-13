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
import { isElement, TestFunctionAnything } from "hast-util-is-element";
import { visit, Visitor } from "unist-util-visit";
import { classnames as cx } from "hast-util-classnames";

export type GistUri = {
  username: string;
  gistId: string;
  file?: string;
  lines: number[];
  highlights: number[];
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
const gistProtocol = `gist:`;

export function parseGistUri(gistUri: string): GistUri | undefined {
  if (!gistUri.startsWith(gistProtocol)) return undefined;

  const uriQuery = gistUri.replace(gistProtocol, ``).split(`?`);

  if (uriQuery.length > 2) return undefined;

  const [uriPath, queryString] = uriQuery;

  const uriSegments = uriPath.split(`/`);

  if (uriSegments.length === 2 && !queryString) {
    return {
      username: uriSegments[0],
      gistId: uriSegments[1],
      lines: [],
      highlights: [],
    } as GistUri;
  }

  if (uriSegments.length !== 2) return undefined;

  const [username, gistId] = uriSegments;
  const gistQuery = qs.parse(queryString, { comma: false });
  const highlightsQuery = gistQuery.highlights?.toString();
  const highlights = highlightsQuery ? parseRange(highlightsQuery) : [];
  const linesQuery = gistQuery.lines?.toString();
  const lines = linesQuery ? parseRange(linesQuery) : [];

  return {
    username,
    gistId,
    file: gistQuery.file?.toString(),
    lines,
    highlights,
  };
}

export function convertFilenameToAttributeFormat(filename: string): string {
  return filename.replace(/^\./, ``)
    .replace(/[^a-zA-Z0-9_]+/g, `-`)
    .toLowerCase();
}

export function getCodeLineIdPrefix(uri: GistUri): string {
  return `file-${convertFilenameToAttributeFormat(uri.file)}-LC`;
}

export function getGistTreeFromHtml(gistHtml: string): Element {
  const rootFragment: Root = fromHtml(gistHtml, { fragment: true });
  const rootElements: Element[] = rootFragment.children
    .filter((child) => isElement(child))
    .map((child) => child as Element);

  if (rootElements.length !== 1) throw new Error(`Gist doesn't exist or has invalid content`);

  return rootElements[0];
}

export function getGistVisitorPredicate(uri: GistUri): TestFunctionAnything {
  return (node: Element) => {
    if (!isElement(node, `tr`)) return false;

    const elementIdPrefix = getCodeLineIdPrefix(uri);
    const codeLine = node.children.find(
      (e: Element) => e.tagName === `td` && String(e.properties?.id).includes(elementIdPrefix),
    );

    return codeLine !== undefined;
  };
}

export function getGistVisitor(uri: GistUri): Visitor {
  return (node: Element, index: number, parent: Parent) => {
    const elementIdPrefix = getCodeLineIdPrefix(uri);
    const codeLine = node.children.find(
      (e: Element) => String(e.properties?.id).includes(elementIdPrefix),
    );

    if (codeLine === undefined) return;

    const lineNumber = parseInt(
      String((codeLine as Element).properties.id).replace(elementIdPrefix, ``),
      10,
    );

    if (Number.isNaN(lineNumber)) return;

    if (uri.highlights.includes(lineNumber)) {
      Object.assign(codeLine, cx(codeLine, `highlighted`));
    }

    if (uri.lines.includes(lineNumber)) {
      parent.children.splice(index, 1);
    }
  };
}

export function getGistElementFromHtml(uri: GistUri, data: Gist): Element {
  const gistHtml = data.div;
  const hasHighlights = uri.highlights.length > 0;
  const hasLines = uri.lines.length > 0;
  const canProcessLinesOrHighlights = (hasLines || hasHighlights) && uri.file;
  const gistElement = getGistTreeFromHtml(gistHtml);

  if (!canProcessLinesOrHighlights) return gistElement;

  visit(
    gistElement,
    getGistVisitorPredicate(uri),
    getGistVisitor(uri),
    true,
  );

  return gistElement;
}

export default async function getGistElement(gistUri: string): Promise<Element> {
  const uri = parseGistUri(gistUri);

  if (!uri) throw new Error(`Failed to load Gist, incorrect URI format`);

  const gistUrl = `${baseGistUrl}/${uri.username}/${uri.gistId}.json${uri.file ? `?file=${uri.file}` : ``}`;
  const response = await axios.get(gistUrl);

  if (response.status === 404) throw new Error(`Gist not found at URL: ${gistUrl}`);
  if (response.status === 500) throw new Error(`An error occurred while requesting Gist from the server`);
  if (response.status !== 200) throw new Error(`Response not supported: ${response.status} - ${response.statusText}`);

  return getGistElementFromHtml(uri, response.data);
}

export function isValidGist(node: Element): boolean {
  return isElement(node, `code`)
    && node.children.length === 1
    && node.children[0].type === `text`
    && node.children[0].value.startsWith(gistProtocol);
}

export async function convertInlineCodeToGist(
  node: Element,
  parent: Parent,
  options: RehypeGistOptions,
): Promise<void> {
  if (!isValidGist(node)) return;
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
