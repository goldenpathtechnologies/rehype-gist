import qs from "qs";
import axios from "axios";
import parseRange from "parse-numeric-range";
import { load } from "cheerio";

type GistUri = {
  username: string;
  gistId: string;
  file?: string;
  lines?: string;
  highlights?: string;
};

type Gist = {
  description: string;
  public: boolean;
  created_at: string;
  files: string[];
  owner: string;
  div: string;
  stylesheet: string;
};

type GistHtmlResponse = {
  data: Gist;
  status: number;
  statusText: string;
};

type GistHtmlContext = {
  handleGistRequest: (gistUrl: string) => Promise<GistHtmlResponse>;
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

export function processGistHtml(uri: GistUri, data: Gist): string {
  const gistHtml = data.div;
  const highlights = uri.highlights ? parseRange(uri.highlights) : [];
  const lines = uri.lines ? parseRange(uri.lines) : [];
  const hasHighlights = highlights.length > 0;
  const hasLines = lines.length > 0;
  const canProcessLinesOrHighlights = (hasLines || hasHighlights) && uri.file;

  if (!canProcessLinesOrHighlights) return gistHtml;

  // handle line removal and highlights
  const $ = load(gistHtml, null, false);
  const file = uri.file?.replace(/^\./, ``)
    .replace(/[^a-zA-Z0-9_]+/g, `-`)
    .toLowerCase();

  // highlight the specific lines, if any
  highlights.forEach((line) => {
    $(`#file-${file}-LC${line}`).addClass(`highlighted`);
  });

  // remove the specific lines, if any
  const codeLines = parseRange(`1-${$(`table tr`).length}`);
  codeLines.forEach((line) => {
    if (lines.includes(line)) return;

    $(`#file-${file}-LC${line}`).parent().remove();
  });

  return $.html().trim();
}

export default async function getGistHtml(
  gistUri: string,
  context: GistHtmlContext = {
    handleGistRequest: (gistUrl: string) => axios.get(gistUrl),
  },
): Promise<string> {
  const uri = parseGistUri(gistUri);

  if (!uri) throw new Error(`Failed to load Gist, incorrect URI format`);

  const gistUrl = `${baseGistUrl}/${uri.username}/${uri.gistId}.json${uri.file ? `?file=${uri.file}` : ``}`;
  const response = await context.handleGistRequest(gistUrl);

  if (response.status === 400) throw new Error(`Gist not found at URL: ${gistUrl}`);
  if (response.status === 500) throw new Error(`An error occurred while requesting Gist from the server`);
  if (response.status !== 200) throw new Error(`Response not supported: ${response.status} - ${response.statusText}`);

  return processGistHtml(uri, response.data);
}
