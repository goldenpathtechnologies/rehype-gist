import axios from "axios";
import type { Element, Properties } from "hast";
import { isElement } from "hast-util-is-element";
import { visit } from "unist-util-visit";
import getGistElement, {
  convertFilenameToAttributeFormat,
  GistUri,
  parseGistUri,
  getGistElementFromHtml,
  getGistVisitorPredicate,
  getGistTreeFromHtml,
  getGistVisitor,
  getCodeLineIdPrefix, RehypeGistOptions, convertInlineCodeToGist, isValidGist, elementHasOneValidChild,
} from "../src/util.js";
import { singleFileGist } from "./data/index.js";

describe(`parseGistUri`, () => {
  it(`Returns undefined when the URI does not have Gist protocol`, () => {
    const result = parseGistUri(
      `darylwright/f33e544d005767520266637c82fe5604`,
    );

    expect(result).toBeUndefined();
  });

  it(`Correctly parses the username and gistId`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604`,
    );

    expect(result).not.toBeUndefined();
    expect(result.username).toBe(`darylwright`);
    expect(result.gistId).toBe(`f33e544d005767520266637c82fe5604`);
  });

  it(`Returns undefined when the username and gistId is separated incorrectly`, () => {
    const result = parseGistUri(
      `gist:darylwright?f33e544d005767520266637c82fe5604`,
    );

    expect(result).toBeUndefined();
  });

  it(`Correctly parses 'file' query string parameter`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604?file=Example.txt`,
    );

    expect(result).not.toBeUndefined();
    expect(result.file).toBe(`Example.txt`);
  });

  it(`Correctly parses 'lines' query string parameter`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604?lines=1,3`,
    );

    expect(result).not.toBeUndefined();
    expect(result.lines).toEqual([1, 3]);
  });

  it(`Correctly parses 'highlights' query string parameter`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604?highlights=2-4,6`,
    );

    expect(result).not.toBeUndefined();
    expect(result.highlights).toEqual([2, 3, 4, 6]);
  });

  it(`Returns undefined when the gistId and query string parameters are separated incorrectly`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604/lines=1,3`,
    );

    expect(result).toBeUndefined();
  });

  it(`Returns undefined when there are excess URI delimeters`, () => {
    const result0 = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604/randomtext?lines=1,3`,
    );
    const result1 = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604?randomtext?lines=1,3`,
    );

    expect(result0).toBeUndefined();
    expect(result1).toBeUndefined();
  });

  it(`Correctly handles empty query strings`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604?`,
    );

    expect(result).not.toBeUndefined();
    expect(result.file).toBeUndefined();
    expect(result.lines).toEqual([]);
    expect(result.highlights).toEqual([]);
  });
});

describe(`convertFilenameToAttributeFormat`, () => {
  it(`Removes leading period from filenames`, () => {
    const result = convertFilenameToAttributeFormat(`.file`);

    expect(result).toBe(`file`);
  });

  it(`Replaces non-alphanumeric and underscore characters with hyphens`, () => {
    const result = convertFilenameToAttributeFormat(`name#of+file09.extension`);

    expect(result).toBe(`name-of-file09-extension`);
  });

  it(`Converts all alphanumeric characters to lowercase`, () => {
    const result = convertFilenameToAttributeFormat(`FILE`);

    expect(result).toBe(`file`);
  });
});

describe(`getGistTreeFromHtml`, () => {
  it(`Disregards sibling nodes that are not elements`, () => {
    const html = `
      <div><div>
      This is plain text.
    `;

    expect(() => getGistTreeFromHtml(html)).not.toThrowError();
  });

  it(`Returns an element from raw HTML`, () => {
    const result = getGistTreeFromHtml(`<div id="test"></div>`);

    expect(isElement(result)).toBeTruthy();
    expect(result.tagName).toBe(`div`);
    expect(result.properties.id).not.toBeUndefined();
    expect(result.properties.id).toBe(`test`);
  });
});

describe(`getGistVisitorPredicate`, () => {
  const defaultTestUri: GistUri = {
    gistId: `justsomerandomwords`,
    username: `username`,
    file: `filename`,
    lines: [],
    highlights: [],
  };
  const defaultPredicateFn = getGistVisitorPredicate(defaultTestUri);

  it(`Returns false when node is not a 'tr' element`, () => {
    const node: Element = { type: `element`, tagName: `table`, children: [] };
    const result = defaultPredicateFn(node);

    expect(result).toBeFalsy();
  });

  it(`Returns false when node does not contain a 'td' element`, () => {
    const child: Element = { type: `element`, tagName: `div`, children: [] };
    const node: Element = { type: `element`, tagName: `tr`, children: [child] };
    const result = defaultPredicateFn(node);

    expect(result).toBeFalsy();
  });

  it(`Returns false when node does not have a child 'td' element whose id attribute matches a prefix`, () => {
    const child: Element = {
      type: `element`,
      tagName: `td`,
      children: [],
      properties: {
        id: `invalid`,
      },
    };
    const node: Element = { type: `element`, tagName: `tr`, children: [child] };
    const result = defaultPredicateFn(node);

    expect(result).toBeFalsy();
  });

  it(`Returns true when node has a child 'td' element whose id attribute matches a prefix`, () => {
    const child: Element = {
      type: `element`,
      tagName: `td`,
      children: [],
      properties: {
        id: `file-filename-LC1`,
      },
    };
    const node: Element = { type: `element`, tagName: `tr`, children: [child] };
    const result = defaultPredicateFn(node);

    expect(result).toBeTruthy();
  });
});

describe(`getGistVisitor`, () => {
  const generateTableRow = (col1Props: Properties = {}, col2Props: Properties = {}): Element => ({
    type: `element`,
    tagName: `tr`,
    children: [
      {
        type: `element`,
        tagName: `td`,
        children: [],
        properties: col1Props,
      },
      {
        type: `element`,
        tagName: `td`,
        children: [],
        properties: col2Props,
      },
    ],
  });
  const generateCodeLineNode = (lineNumber: number): Element => generateTableRow(
    { id: `random` },
    { id: `${getCodeLineIdPrefix(singleFileGist.uri)}${lineNumber}` },
  );
  const executeSut = (uri: GistUri, rootNode: Element) => visit(
    rootNode,
    // getGistVisitorPredicate(uri),
    (node: Element) => isElement(node, `tr`), // using a simpler predicate so more elements get fed to visitor
    getGistVisitor(uri),
    true,
  );

  it(`Returns the Gist HTML with highlighted lines when specified`, () => {
    const lineNumber = 3;
    const uri: GistUri = {
      ...singleFileGist.uri,
      highlights: [lineNumber],
    };
    const node: Element = generateCodeLineNode(lineNumber);
    const parent: Element = {
      type: `element`,
      tagName: `table`,
      children: [node],
    };

    executeSut(uri, parent);

    const highlightedNode = node.children[1] as Element;

    expect(highlightedNode.properties.className).not.toBeUndefined();
    expect(highlightedNode.properties.className).toContain(`highlighted`);
  });

  it(`Returns the Gist HTML with lines removed when specified`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      lines: [2, 3, 5],
    };
    const nodes: Element[] = [...Array(5)].map((_, index) => generateCodeLineNode(index + 1));
    const parent: Element = {
      type: `element`,
      tagName: `table`,
      children: nodes,
    };

    executeSut(uri, parent);

    const lineOne = (parent.children[0] as Element).children[1] as Element;
    const lineFour = (parent.children[1] as Element).children[1] as Element;

    expect(parent.children.length).toBe(2);
    expect(lineOne.properties.id).toBe(`${getCodeLineIdPrefix(uri)}1`);
    expect(lineFour.properties.id).toBe(`${getCodeLineIdPrefix(uri)}4`);
  });

  it(`Does not modify node if id attribute is invalid`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      highlights: [1],
      lines: [1],
    };
    // Must include prefix or test won't get past predicate. Excluding line number to make invalid.
    const node0: Element = generateTableRow(null, { id: getCodeLineIdPrefix(uri) });
    const expected0: Element = JSON.parse(JSON.stringify(node0));
    const parent: Element = {
      type: `element`,
      tagName: `table`,
      children: [node0],
    };

    executeSut(uri, parent);
    expect(node0).toEqual(expected0);

    const node1: Element = generateTableRow();
    const expected1: Element = JSON.parse(JSON.stringify(node1));
    parent.children = [node1];

    executeSut(uri, parent);
    expect(node1).toEqual(expected1);
  });
});

describe(`getGistElementFromHtml`, () => {
  it(`Returns the Gist Element unmodified with only username and gistId provided`, () => {
    const { uri, gist } = singleFileGist;
    const result = getGistElementFromHtml(uri, gist);
    const expected = getGistTreeFromHtml(gist.div);

    expect(result).toEqual(expected);
  });

  it(`Returns the Gist Element unmodified if the file is not provided`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      file: undefined,
      lines: [1],
      highlights: [2],
    };
    const result = getGistElementFromHtml(uri, singleFileGist.gist);
    const expected = getGistTreeFromHtml(singleFileGist.gist.div);

    expect(result).toEqual(expected);
  });

  it(`Returns the Gist Element unmodified if lines and highlights are not provided`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      file: singleFileGist.gist.files[0],
    };
    const result = getGistElementFromHtml(uri, singleFileGist.gist);
    const expected = getGistTreeFromHtml(singleFileGist.gist.div);

    expect(result).toEqual(expected);
  });

  it(`Modifies Gist Element when the file, lines, and highlights are provided`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      lines: [1],
      highlights: [2],
    };
    const result = getGistElementFromHtml(uri, singleFileGist.gist);
    const unexpected = getGistTreeFromHtml(singleFileGist.gist.div);

    expect(result).not.toEqual(unexpected);
  });
});

describe(`getGistElement`, () => {
  it(`Throws an error when Gist URI has incorrect format`, async () => {
    await expect(() => getGistElement(`this is invalid`)).rejects.toThrow(
      `Failed to load Gist, incorrect URI format`,
    );
  });

  it(`Throws an error when the Gist at the specified URI doesn't exist`, async () => {
    axios.get = import.meta.jest.fn().mockResolvedValue({ status: 404 });
    await expect(getGistElement(`gist:randomdude/cj9ht92huryh89rh34h8rh8`)).rejects.toThrow(
      `Gist not found at URL: https://gist.github.com/randomdude/cj9ht92huryh89rh34h8rh8.json`,
    );
  });

  it(`Throws an error when there is a server error while requesting the Gist`, async () => {
    axios.get = import.meta.jest.fn().mockResolvedValue({ status: 500 });
    await expect(getGistElement(`gist:a/b`)).rejects.toThrow(
      `An error occurred while requesting Gist from the server`,
    );
  });

  it.each([
    [300, `x`, `300 - x`],
    [401, `y`, `401 - y`],
    [418, `I'm a little teapot`, `418 - I'm a little teapot`],
  ])(`Throws an error if the Gist request status is unsupported`, async (status, statusText, expected) => {
    axios.get = import.meta.jest.fn().mockResolvedValue({
      status,
      statusText,
    });
    await expect(getGistElement(`gist:x/y`)).rejects.toThrow(`Response not supported: ${expected}`);
  });
});

describe(`elementHasOneValidChild`, () => {
  it(`Returns false when element contains more than one child element`, () => {
    const node: Element = {
      type: `element`,
      tagName: `div`,
      children: [
        {
          type: `element`,
          tagName: `span`,
          children: [],
        },
        {
          type: `element`,
          tagName: `span`,
          children: [],
        },
      ],
    };

    const result = elementHasOneValidChild(node);

    expect(result).toBeFalsy();
  });

  it(`Returns false when element contains only whitespace`, () => {
    const node: Element = {
      type: `element`,
      tagName: `div`,
      children: [
        {
          type: `text`,
          value: `\n\t \r\n \r`,
        },
      ],
    };

    const result = elementHasOneValidChild(node);

    expect(result).toBeFalsy();
  });

  it(`Returns true when element contains one child element`, () => {
    const node: Element = {
      type: `element`,
      tagName: `div`,
      children: [
        {
          type: `element`,
          tagName: `span`,
          children: [],
        },
      ],
    };

    const result = elementHasOneValidChild(node);

    expect(result).toBeTruthy();
  });

  it(`Returns true when element contains one child element and at least one instance of whitespace`, () => {
    const node: Element = {
      type: `element`,
      tagName: `div`,
      children: [
        {
          type: `text`,
          value: `    \n`,
        },
        {
          type: `element`,
          tagName: `span`,
          children: [],
        },
        {
          type: `text`,
          value: `    \n`,
        },
      ],
    };

    const result = elementHasOneValidChild(node);

    expect(result).toBeTruthy();
  });
});

describe(`convertInlineCodeToGist`, () => {
  beforeAll(() => {
    axios.get = import.meta.jest.fn().mockResolvedValue({
      status: 200,
      statusText: `OK`,
      data: singleFileGist.gist,
    });
  });

  const defaultOptions: RehypeGistOptions = {
    replaceParentParagraph: true,
    omitCodeBlocks: true,
  };

  it(`Does not transform elements without text`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `code`,
      children: [],
    };
    const parent: Element = {
      type: `element`,
      tagName: `div`,
      children: [node],
    };
    const expectedNode = JSON.parse(JSON.stringify(node));
    const expectedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, defaultOptions);

    expect(node).toEqual(expectedNode);
    expect(parent).toEqual(expectedParent);
  });

  it(`Does not transform elements that are not 'code' tags`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `span`,
      children: [
        {
          type: `text`,
          value: `gist:a/b`,
        },
      ],
    };
    const parent: Element = {
      type: `element`,
      tagName: `div`,
      children: [node],
    };
    const expectedNode = JSON.parse(JSON.stringify(node));
    const expectedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, defaultOptions);

    expect(node).toEqual(expectedNode);
    expect(parent).toEqual(expectedParent);
  });

  it(`Handles 'code' tag transformations that have 'pre' as direct parent`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `code`,
      children: [
        {
          type: `text`,
          value: `gist:a/b`,
        },
      ],
    };
    const parent: Element = {
      type: `element`,
      tagName: `pre`,
      children: [node],
    };
    const expectedUnmodifiedNode = JSON.parse(JSON.stringify(node));
    const expectedUnmodifiedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, defaultOptions);

    expect(node).toEqual(expectedUnmodifiedNode);
    expect(parent).toEqual(expectedUnmodifiedParent);

    await convertInlineCodeToGist(node, parent, { ...defaultOptions, omitCodeBlocks: false });

    expect(node).not.toEqual(expectedUnmodifiedNode);
    expect(parent).not.toEqual(expectedUnmodifiedParent);
    expect(node.tagName).toBe(`div`);
    expect(node.properties.className).toContain(`gist`);
  });

  it(`Does not replace parent 'p' tag if the 'code' tag has sibling elements`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `code`,
      children: [
        {
          type: `text`,
          value: `gist:a/b`,
        },
      ],
    };
    const siblingNode: Element = {
      type: `element`,
      tagName: `span`,
      children: [],
    };
    const parent: Element = {
      type: `element`,
      tagName: `pre`,
      children: [node, siblingNode],
    };
    const expectedUnmodifiedNode = JSON.parse(JSON.stringify(node));
    const expectedUnmodifiedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, defaultOptions);

    expect(node).toEqual(expectedUnmodifiedNode);
    expect(parent).toEqual(expectedUnmodifiedParent);
  });

  it(`Handles 'code' tag transformations that replace its parent 'p' tag`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `code`,
      children: [
        {
          type: `text`,
          value: `gist:a/b`,
        },
      ],
    };
    const parent: Element = {
      type: `element`,
      tagName: `p`,
      children: [node],
    };
    const unexpectedUnmodifiedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, defaultOptions);

    expect(parent).not.toEqual(unexpectedUnmodifiedParent);
    expect(parent.tagName).toBe(`div`);
    expect(parent.properties.className).toContain(`gist`);
  });

  it(`Handles 'code' tag transformations that do not replace its parent 'p' tag`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `code`,
      children: [
        {
          type: `text`,
          value: `gist:a/b`,
        },
      ],
    };
    const parent: Element = {
      type: `element`,
      tagName: `p`,
      children: [node],
    };
    const unexpectedUnmodifiedNode = JSON.parse(JSON.stringify(node));
    const unexpectedUnmodifiedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, {
      ...defaultOptions,
      replaceParentParagraph: false,
    });

    expect(node).not.toEqual(unexpectedUnmodifiedNode);
    expect(parent).not.toEqual(unexpectedUnmodifiedParent);
    expect(node.tagName).toBe(`div`);
    expect(node.properties.className).toContain(`gist`);
    expect(parent.tagName).toBe(`p`);
  });

  it(`Transforms 'code' element to Gist`, async () => {
    const node: Element = {
      type: `element`,
      tagName: `code`,
      children: [
        {
          type: `text`,
          value: `gist:a/b`,
        },
      ],
    };
    const parent: Element = {
      type: `element`,
      tagName: `div`,
      children: [node],
    };
    const unexpectedUnmodifiedNode = JSON.parse(JSON.stringify(node));
    const unexpectedUnmodifiedParent = JSON.parse(JSON.stringify(parent));

    await convertInlineCodeToGist(node, parent, defaultOptions);

    expect(node).not.toEqual(unexpectedUnmodifiedNode);
    expect(parent).not.toEqual(unexpectedUnmodifiedParent);
    expect(node.tagName).toBe(`div`);
    expect(node.properties.className).toContain(`gist`);
  });
});

describe(`isValidGist`, () => {
  it(`Is valid only if element is a 'code' tag`, () => {
    const validNode: Element = {
      type: `element`,
      tagName: `code`,
      children: [{
        type: `text`,
        value: `gist:a/b`,
      }],
    };
    const invalidNode: Element = {
      type: `element`,
      tagName: `span`,
      children: [{
        type: `text`,
        value: `gist:a/b`,
      }],
    };

    expect(isValidGist(validNode)).toBeTruthy();
    expect(isValidGist(invalidNode)).toBeFalsy();
  });

  it(`Is invalid if element has more than one child`, () => {
    const invalidNode: Element = {
      type: `element`,
      tagName: `code`,
      children: [{
        type: `text`,
        value: `gist:a/b`,
      },
      {
        type: `text`,
        value: `gist:a/b`,
      }],
    };

    expect(isValidGist(invalidNode)).toBeFalsy();
  });

  it(`Is invalid if child of element is not of type 'text'`, () => {
    const invalidNode: Element = {
      type: `element`,
      tagName: `code`,
      children: [{
        type: `element`,
        tagName: `span`,
        children: [
          {
            type: `text`,
            value: `gist:a/b`,
          },
        ],
      }],
    };

    expect(isValidGist(invalidNode)).toBeFalsy();
  });

  it(`Is valid if element text begins with 'gist:' protocol`, () => {
    const invalidNode: Element = {
      type: `element`,
      tagName: `code`,
      children: [{
        type: `text`,
        value: `gisp:a/b`,
      }],
    };

    expect(isValidGist(invalidNode)).toBeFalsy();
  });
});
