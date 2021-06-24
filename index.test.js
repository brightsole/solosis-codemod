const fs = require('fs');

const { recurseFolders, modifyFile } = require('./index.mjs');

jest.mock('fs');

// TODO: fix once https://github.com/facebook/jest/issues/10025 is solved
// THESE TESTS ARE NONFUNCTIONAL, AND A BABEL SETUP IS OVERKILL IF IT'S JUST TESTING
// HIGHER LEVELS OF JEST WILL EVENTUALLY WORK

describe('modifyFile', () => {
  it('replaces all "thing" with the replacement argument', () => {
    fs.readFileSync.mockReturnValueOnce('thing thing something oneThing');
    fs.writeFile.mockResolve();

    modifyFile('./testygon.js', 'gank');

    expect(fs.writeFile).toHaveBeenCalledWith('./testygon.js', 'gank gank somegank oneGank');
  });
});

describe('recurseFolders', () => {
  it('calls modifyFile on every file in a tree', () => {
    fs.readdirSync.mockReturnValueOnce(['gitto', 'gotto', 'gutto']);
    fs.lstatSync.mockReturnValue({ isDirectory: () => false });
    fs.readFileSync.mockReturnValue('thing');
    fs.writeFile.mockResolve();

    recurseFolders();

    expect(fs.writeFile).toHaveBeenCalled();
  });
});
