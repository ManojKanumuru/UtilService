`use strict`;

var _ = require('underscore');

var Promise = require('bluebird');

var validator = require('../generics/validator');

var responses = require('../generics/responses');

const constants = require('../generics/constants');

const errorCodes = require('../generics/errorCodes');

var handlebars = require('handlebars');

var async = require('async');

let formMailObj = function(emailRequest, secretKey){

  console.log("inside formMailObj:",emailRequest);

  return new Promise(function(resolve, reject){
    let sg = require('sendgrid')(secretKey);
  
    var helper = require('sendgrid').mail,
    	from = new helper.Email(emailRequest.from),
     	to	= new helper.Email(emailRequest.to),
      	subject = emailRequest.subject,
      	content = new helper.Content('text/plain', emailRequest.text),
      	attachment = new helper.Attachment(),
      	mail = new helper.Mail(from, subject, to, content);


     var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

  var emailArray = emailRequest.toEmailArray;
  var personalizations = [];
  emailArray.forEach(function(email){
    personalizations.push({"email": email});
  });
  
  request.body.personalizations[0].to = personalizations;

  console.log("request:",request);

    sg.API(request, function(err, response){
      console.log("before:"+JSON.stringify(response));
      if(err){
        console.log("err:"+JSON.stringify(err));
        if(err.message === "Response error" && err.response 
            && err.response.body && err.response.body.errors && err.response.body.errors.length){
            if(err.response.body.errors[0].message === "Does not contain a valid address." 
              && err.response.body.errors[0].field.indexOf('to') > -1){
              return reject('Does not contain a valid email address in toEmail.Please do check again');
            }else{
              console.log("Error",err)
              return reject(err);
            }
        }else{
          return reject(err);
        }
      }else{
          console.log("email sent successfully:",response);
          return resolve(response);
      }
    });
  });
}

exports.sendMail = function(req, res){

   console.log("request inside sendMail:",req.body);
  
	let requestObj = {};
		  
  		requestObj = req.body;

  Promise.coroutine(function *(){

    yield validator.validateEmailRequest(requestObj);

    requestObj.toEmailArray = _.uniq(requestObj.to.split(','));

    let emailSent = yield formMailObj(requestObj, constants.acc);

    return responses.sendResponse(res, constants.success, constants.messages.emailSentSuccess, emailSent.body);
  })().catch(function (error) {
      return responses.sendError(res, error, constants.failure);
  });
}


let sendHtmlMail = function(emailRequest, secretKey){

  console.log("inside sendHtmlMail:",emailRequest);

  return new Promise(function(resolve, reject){

    var sg = require('sendgrid')(secretKey);

    var template = handlebars.compile(emailRequest.template);

    var result = template(emailRequest.htmlContent);

    console.log("result after binding is ::", result);
  
        var helper = require('sendgrid').mail,
          from  = new helper.Email(emailRequest.from),
          to  = new helper.Email(emailRequest.to),
          subject = emailRequest.subject,
          content = new helper.Content('text/html', result),
          // attachment = new helper.Attachment(),
          mail = new helper.Mail(from, subject, to, content);


        var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON()
        });

        if(emailRequest.hasOwnProperty('toEmailArray')){
          var emailArray = emailRequest.toEmailArray;
          var personalizations = [];
          emailArray.forEach(function(email){
            personalizations.push({"email": email});
          });
        
          request.body.personalizations[0].to = personalizations;
        }
        
        console.log("request:",request);

        sg.API(request, function(err, response){
          console.log("before:"+JSON.stringify(response));
          if(err){
            console.log("err:"+JSON.stringify(err));
            if(err.message === "Response error" && err.response 
                && err.response.body && err.response.body.errors && err.response.body.errors.length){
                if(err.response.body.errors[0].message === "Does not contain a valid address." 
                  && err.response.body.errors[0].field.indexOf('to') > -1){
                  return reject('Does not contain a valid email address in toEmail.Please do check again');
                }else{
                  console.log("Error",err)
                  return reject(err);
                }
            }else{
              return reject(err);
            }
          }else{
              console.log("email sent successfully:",response);
              return resolve(response);
          }
        });
  })
}

exports.sendEmailWithHtmlData = function(req, res){

  console.log("request inside sendEmailWithHtmlData:",req.body);
  
	let requestObj = {};
	    requestObj = req.body;

  Promise.coroutine(function *(){

    yield validator.validateHtmlEmailRequest(requestObj);

    requestObj.toEmailArray = _.uniq(requestObj.to.split(','));

    let emailSent = yield sendHtmlMail(requestObj, constants.acc);

		return responses.sendResponse(res, constants.success, constants.messages.emailSentSuccess, emailSent.body);
  
  })().catch(function (error) {
		return responses.sendError(res, error, constants.failure);
	});
}

exports.sendHtmlBulkMail = function(req, res){

  console.log("inside sendHtmlBulkMail", req.body);

    let request = {}; 
        request = req.body;
  Promise.coroutine(function *(){

    let sendEmails = yield processBulkEmails(request);

    return responses.sendResponse(res, constants.success, constants.messages.emailSentSuccess, {});
    
  })().catch(function(err){
    return responses.sendError(res, err, constants.failure);
  })
}


let processBulkEmails = function(request){

  console.log("inside processBulkEmails");
  
  return new Promise(function(resolve, reject){

    async.forEachSeries(request.staffList, function(obj, callback){

      let requestObj = {
          from 	: request.data.adminEmail,
          to 		: obj.officialEmail,
          subject : request.data.subject,
          template: request.data.template,
          htmlContent : {
            'userName' : obj.userName,
            'password' : request.data.commonPwd,
            'approvalLink' : obj.approvalLink
          }
      };
      sendHtmlMail(requestObj, constants.acc).then(function(data){
        console.log("email sent in each call");
        callback();
      }).catch(function(err){
        callback();
      })
    }, function(data){
      return resolve();
    })
  })
}


