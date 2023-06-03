// import axios from "axios";
import {
  convertFilenameToAttributeFormat,
  GistUri,
  parseGistUri,
  getGistElementFromHtml,
} from "../src/util";
import { singleFileGist } from "./data";

// jest.mock(`axios`);

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
    expect(result.lines).toBe(`1,3`);
  });

  it(`Correctly parses 'highlights' query string parameter`, () => {
    const result = parseGistUri(
      `gist:darylwright/f33e544d005767520266637c82fe5604?highlights=2-4,6`,
    );

    expect(result).not.toBeUndefined();
    expect(result.highlights).toBe(`2-4,6`);
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
    expect(result.lines).toBeUndefined();
    expect(result.highlights).toBeUndefined();
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

describe(`getGistElementFromHtml`, () => {
  it(`Returns the Gist HTML unmodified with only username and gistId provided`, () => {
    const { uri, gist } = singleFileGist;
    const result = getGistElementFromHtml(uri, gist);

    expect(result).toBe(gist.div);
  });

  it(`Returns the Gist HTML unmodified if the file is not provided`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      lines: `1`,
      highlights: `2`,
    };
    const result = getGistElementFromHtml(uri, singleFileGist.gist);

    expect(result).toBe(singleFileGist.gist.div);
  });

  it(`Returns the Gist HTML unmodified if lines and highlights are not provided`, () => {
    const uri: GistUri = {
      ...singleFileGist.uri,
      file: singleFileGist.gist.files[0],
    };
    const result = getGistElementFromHtml(uri, singleFileGist.gist);

    expect(result).toBe(singleFileGist.gist.div);
  });

  it(`Returns the Gist HTML with highlighted lines when specified`, () => {

  });

  it(`Returns the Gist HTML with lines removed when specified`, () => {

  });
});

describe(`getGistElement`, () => {
  it(`Throws an error when Gist URI has incorrect format`, () => {

  });

  it(`Throws an error when the Gist at the specified URI doesn't exist`, () => {

  });

  it(`Throws an error when there is a server error while requesting the Gist`, () => {

  });

  it(`Throws an error if the Gist request status is unsupported`, () => {

  });
});

describe(`convertInlineCodeToGist`, () => {
  it(`Does not transform elements that are not 'code' tags`, () => {

  });

  it(`Does not transform 'code' tags that have 'pre' as direct parent`, () => {

  });

  it(`Does not replace parent 'p' tag if the 'code' tag has sibling elements`, () => {

  });

  it(`Throws an error if root Gist 'div' element has siblings`, () => {

  });

  it(`Replaces parent 'p' tag when transforming`, () => {

  });

  it(`Transforms 'code' element to Gist`, () => {

  });
});

describe(`isValidGist`, () => {
  it(`Is valid if element is a 'code' tag`, () => {

  });

  it(`Is valid if element has a single child`, () => {

  });

  it(`Is valid if child of element is of type 'text'`, () => {

  });

  it(`Is valid if element text begins with 'gist:' protocol`, () => {

  });
});
