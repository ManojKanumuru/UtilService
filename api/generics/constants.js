'use strict';

let constants = {
	'success'		: 200,
    'failure'		: 201,
    'userRole'  : {
        'superAdmin'    : 'superadmin',
        'staff'         : 'staff'
    },
    'messages' : {
        'success'               : 'success',
        'emailSentSuccess'      : 'email sent successfully',
        'deleteSuccess'         : 'delete success',
        'loginValid' 			: 'login credentials are valid',
        'loginInvalid' 			: 'Invalid Credentials',
        'createUserSuccess'     : 'User created successfully'
    },
    'sendgridKey' : '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'
};

module.exports =  constants;