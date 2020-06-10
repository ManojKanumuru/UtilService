var express = require('express');

let app = express();

const port = 3001;

require('./api/commons/express.js')(app);

require('./api/commons/routes.js')(app);

let env = process.env.NODE_ENV || 'development';

app.listen(port, () => {
    console.log("Listening on port 3001", env);
});