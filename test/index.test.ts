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
