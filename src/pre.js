const { addPath } = require('app-module-path')
const dotenv = require('dotenv')
const path = require('path')

// Load .env file
dotenv.config();

// Add the server directory to the NODE_PATH environment variable so we can
// require modules in our project without the ../../../ relative dir mess.
addPath(path.resolve(__dirname, './'));