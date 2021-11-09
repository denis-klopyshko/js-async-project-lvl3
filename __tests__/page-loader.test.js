import { promises as fs } from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import pageLoader from '../src/index';

let tempDirName;

beforeEach(async () => {
  tempDirName = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test.only('should load the page', async () => {
  const url = 'https://hexlet.io';
  const pathname = '/courses';
  const body = '<html><head></head><body></body></html>';

  nock(url)
    .get(pathname)
    .reply(200, body);

  await pageLoader(url + pathname, tempDirName);

  const tempDirFiles = await fs.readdir(tempDirName);
  const tempFilePath = path.join(tempDirName, tempDirFiles[0]);
  const data = await fs.readFile(tempFilePath, 'utf8');

  expect(data).toBe(body);
});

test('should exit with code = 1 if error', async () => {

});
