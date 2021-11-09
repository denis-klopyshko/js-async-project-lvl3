#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import pageLoader from '../index.js';

const program = new Command();

program
  .version('1.0.0')
  .description('JS Async')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', process.cwd())
  .action((requestUrl) => {
    const { output } = program.opts();
    return pageLoader(requestUrl, output)
      .catch((error) => {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      });
  })
  .parse(process.argv);
