import qs from "qs";
import axios from "axios";
import parseRange from "parse-numeric-range";
import { load } from "cheerio";

type GistProps = {
  username: string;
  gistId: string;
  file?: string;
  lines?: string;
  highlights?: string;
};

const baseGistUrl = `https://gist.github.com`;

function parseGistProtocolUri(gistUri: string): GistProps | undefined {
  if (!gistUri.startsWith(`gist:`)) return undefined;

  const uriSegments = gistUri.replace(`gist:`, ``).split(/[/?]/);

  if (uriSegments.length === 2) {
    return {
      username: uriSegments[0],
      gistId: uriSegments[1],
    } as GistProps;
  }

  if (uriSegments.length !== 3) return undefined;

  const [username, gistId, queryString] = uriSegments;

  const gistQuery = qs.parse(queryString, { comma: false });

  return {
    username,
    gistId,
    file: gistQuery.file.toString(),
    lines: gistQuery.lines.toString(),
    highlights: gistQuery.highlights.toString(),
  };
}

export default async function getGistHtml(gistUri: string): Promise<string> {
  const source = parseGistProtocolUri(gistUri);

  if (!source) return `<div class="bg-tertiary rounded-lg p-4 text-sm">Failed to load Gist: incorrect URI format</div>`;

  const gistUrl = `${baseGistUrl}/${source.username}/${source.gistId}.json${source.file ? `?file=${source.file}` : ``}`;

  const { data } = await axios.get(gistUrl);

  const gistHtml = data.div;
  const highlights = source.highlights ? parseRange(source.highlights) : [];
  const lines = source.lines ? parseRange(source.lines) : [];
  const hasHighlights = highlights.length > 0;
  const hasLines = lines.length > 0;
  const canProcessLinesAndHighlights = (hasLines || hasHighlights) && source.file;

  if (!canProcessLinesAndHighlights) return gistHtml;

  // handle line removal and highlights
  const $ = load(gistHtml, null, false);
  const file = source.file?.replace(/^\./, ``)
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
