'use strict';

 var Joi= require('joi');

 var errorCodes = require('./errorCodes');

 const emailSchema = Joi.object().keys({
    from 	: Joi.string().email().required().label(errorCodes.errorMessages.fromEmailRequired),
	to 		: Joi.string().email().trim().required().label(errorCodes.errorMessages.toEmailRequired),
	subject : Joi.string().trim().min(1).max(50).strict().required().label(errorCodes.errorMessages.subjectRequired),
	text 	: Joi.string().trim().required().label(errorCodes.errorMessages.textRequired)
});

exports.validateEmailRequest = function(request){
	return new Promise(function(resolve, reject){

        Joi.validate(request, emailSchema, function(err, value){
            if(err && Array.isArray(err.details) && err.details.length) {
				if(err.details[0].type === "object.allowUnknown"){
					return reject(err.details[0].message.replace(/"/g,""));
				}else{
					return reject(err.details[0].message.split('"')[1]);
				} 
            } else {
                return resolve();
            }
		});
	});
}

const htmlEmailSchema = Joi.object().keys({
    from 	: Joi.string().email().required().label(errorCodes.errorMessages.fromEmailRequired),
	to 		: Joi.string().email().trim().required().label(errorCodes.errorMessages.toEmailRequired),
	subject : Joi.string().trim().min(1).max(50).strict().required().label(errorCodes.errorMessages.subjectRequired),
	template: Joi.string().label(errorCodes.errorMessages.templateTypeError),
	htmlContent : Joi.object().label(errorCodes.errorMessages.htmlContentTypeError)
});

exports.validateHtmlEmailRequest = function(request){
	return new Promise(function(resolve, reject){

        Joi.validate(request, htmlEmailSchema, function(err, value){
            if(err && Array.isArray(err.details) && err.details.length) {
				if(err.details[0].type === "object.allowUnknown"){
					return reject(err.details[0].message.replace(/"/g,""));
				}else{
					return reject(err.details[0].message.split('"')[1]);
				} 
            } else {
                return resolve();
            }
		});
	});
}