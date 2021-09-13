#!/usr/bin/env node
import { Command } from 'commander/esm.mjs';
import loader from '../index.js';

const program = new Command();

program
  .version('1.0.0')
  .description('JS Async')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', process.cwd())
  .action((requestUrl) => {
    const { output } = program.opts();
    return loader(requestUrl, output)
      .catch((error) => {
        process.exitCode = 1;
        console.error(`Error! ${error.message}`);
      });
  })
  .parse(process.argv);
