import axios from 'axios';
import axiosDebug from 'axios-debug-log';
import debug from 'debug';

const log = debug('page-loader:axios-info');
const httpClient = axios.create();

axiosDebug.addLogger(httpClient, log);

export default httpClient;
