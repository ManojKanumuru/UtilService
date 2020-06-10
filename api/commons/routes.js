'use strict';

var express = require('express');

let apiRoutes = express.Router();

const utilController = require('./../controller/utilController');

module.exports = function(app){

	apiRoutes.post('/util/sendMail', utilController.sendMail);

	apiRoutes.post('/util/sendHtmlMail', utilController.sendEmailWithHtmlData);

	apiRoutes.post('/util/sendHtmlBulkMail', utilController.sendHtmlBulkMail);

	app.use('/api', apiRoutes);
}