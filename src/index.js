import { promises as fs } from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import _ from 'lodash';
import Listr from 'listr';
import debug from 'debug';
import httpClient from './lib/http-client.js';

const logInfo = debug('page-loader:info');
const logError = debug('page-loader:error');

const buildName = (stringToFormat, ending = '') => {
  const trimmedString = _.trim(stringToFormat, '/');
  const nameWithDashes = _.replace(trimmedString, /\W/g, '-');
  return `${nameWithDashes}${ending}`;
};

const buildLocalPath = (pathname, resourcesDirName) => {
  const { dir, name, ext } = path.parse(pathname);
  const formattedLinkName = buildName(path.join(dir, name), ext);
  return path.join(resourcesDirName, formattedLinkName);
};

const tagAttrMapping = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const extractAndUpdateLinks = (html, resourcesDirName, baseUrl) => {
  const $ = cheerio.load(html);
  const resourcesLinks = [];
  Object.keys(tagAttrMapping).forEach((tag) => {
    $(tag)
      .filter((i, element) => !_.isUndefined(element.attribs[tagAttrMapping[tag]]))
      .filter((i, element) => !_.startsWith(element.attribs[tagAttrMapping[tag]], 'http'))
      .each((i, element) => {
        const attributeValue = element.attribs[tagAttrMapping[tag]];
        const absoluteLink = new URL(attributeValue, baseUrl);

        const { pathname, href } = absoluteLink;
        resourcesLinks.push(href);

        const localLink = buildLocalPath(pathname, resourcesDirName);
        return $(element).attr(tagAttrMapping[tag], localLink);
      });
  });

  return { html: $.html(), resourcesLinks };
};

const downloadResource = (link) => httpClient.get(link, { responseType: 'arraybuffer' })
  .catch((err) => {
    logError(`Can't download resource from ${link}!`, err);
    throw err;
  });

export default function (baseUrl, basePath) {
  const { hostname, pathname } = new URL(baseUrl);
  const htmlFileName = buildName(`${hostname}${pathname}`, '.html');
  const htmlFilePath = path.join(basePath, htmlFileName);

  const resourcesDirName = buildName(`${hostname}${pathname}`, '_files');
  const resourcesDirPath = path.join(basePath, resourcesDirName);

  let links;

  return httpClient.get(baseUrl)
    .then(({ data }) => {
      const { html, resourcesLinks } = extractAndUpdateLinks(data, resourcesDirName, baseUrl);
      links = resourcesLinks;
      return html;
    })
    .then((html) => fs.writeFile(htmlFilePath, html))
    .then(() => fs.mkdir(resourcesDirPath))
    .then(() => {
      const tasks = links.map((item) => {
        const { pathname: linkPath } = new URL(item);
        const localPath = buildLocalPath(linkPath, resourcesDirName);
        return {
          title: `${item}`,
          task: () => downloadResource(item)
            .then(({ data }) => fs.writeFile(path.join(basePath, localPath), data))
            .catch((err) => {
              console.error(err);
              throw err;
            }),
        };
      });
      const downloadResourcesTasks = new Listr(tasks, { concurrent: true });
      return downloadResourcesTasks.run();
    })
    .then(() => console.log(`Page was successfully downloaded into '${basePath}/${htmlFileName}'`));
}
