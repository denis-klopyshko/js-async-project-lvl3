#!/usr/bin/env node
import {version, description} from '../../package.json';
import {Command as program} from "commander";


program
    .version(version)
    .description(description)
    .arguments('<url>')
    .option('-o, --output [folder]', 'output folder', process.cwd())
    .action(requestUrl => loader(requestUrl, program.output)
        .catch((error) => {
            process.exitCode = 1;
            console.error(`Error! ${error.message}`);
        }))
    .parse(process.argv);