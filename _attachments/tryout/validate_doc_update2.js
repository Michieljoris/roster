// {
// "validate_doc_update" :
// }
function(newDoc, oldDoc, userCtx, secObj) {
    var type = 'location';
    var dbname = 'waterfordwest';
     
    if ((oldDoc && oldDoc.type !== type) || newDoc.type !== type ) {
        throw({forbidden : 'doc.type must be ' + type});
    } // we only allow type docs 
    if (type === 'location')
        if ((oldDoc && oldDoc.location !== dbname) || newDoc.location !== dbname ) {
            throw({forbidden : 'doc.type must be ' + type});
        }

     var is_type_admin = function(userCtx, secObj) {
        // see if the user a type admin specified by name
        // if(secObj && secObj.members && secObj.members.names) {
        //     if(secObj.members.names.indexOf(userCtx.name) !== -1) {
        //         return true; // type admin
        //     }
        // }

        // see if the user a type admin specified by role
        for(var idx = 0; idx < userCtx.roles.length; idx++) {
            var user_role = userCtx.roles[idx];
            if(user_role === type+'-rw') {
                return true; // role matches!
            }
        }
        // if(secObj && secObj.members && secObj.members.roles) {
        //     var db_roles = secObj.members.roles;
        //     for(var idx = 0; idx < userCtx.roles.length; idx++) {
        //         var user_role = userCtx.roles[idx];
        //         if(db_roles.indexOf(user_role) !== -1) {
        //             return true; // role matches!
        //         }
        //     }
        // }
        return false; // default to no type admin
    };
        
    if (
        !is_type_admin(userCtx, secObj)) {
        throw({forbidden: 'Only members or [server, database, ' + type + '] admins can update this database'});
    }
    // if (!is_server_or_database_admin(userCtx, secObj) &&
    //     !is_type_admin(userCtx, secObj)) {
    //     if (oldDoc) { // validate non-admin updates
    //         if (userCtx.name !== newDoc.name) {
    //             throw({
    //                 forbidden: 'You may only update your own user document.'
    //             });
    //         }
    //         // validate role updates
    //         var oldRoles = oldDoc.roles.sort();
    //         var newRoles = newDoc.roles.sort();

    //         if (oldRoles.length !== newRoles.length) {
    //             throw({forbidden: 'Only _admin may edit roles'});
    //         }

    //         for (var i = 0; i < oldRoles.length; i++) {
    //             if (oldRoles[i] !== newRoles[i]) {
    //                 throw({forbidden: 'Only _admin may edit roles'});
    //             }
    //         }
    //     } else if (newDoc.roles.length > 0) {
    //         throw({forbidden: 'Only _admin may set roles'});
    //     }
    // }

    // no system roles in users db
    // for (var i = 0; i < newDoc.roles.length; i++) {
    //     if (newDoc.roles[i][0] === '_') {
    //         throw({
    //             forbidden:
    //             'No system roles (starting with underscore) in users db.'
    //         });
    //     }
    // }

    // no system names as names
    // if (newDoc.name[0] === '_') {
    //     throw({forbidden: 'Username may not start with underscore.'});
    // }

    // var badUserNameChars = [':'];

    // for (var i = 0; i < badUserNameChars.length; i++) {
    //     if (newDoc.name.indexOf(badUserNameChars[i]) >= 0) {
    //         throw({forbidden: 'Character `' + badUserNameChars[i] +
    //                 '` is not allowed in usernames.'});
    //     }
    // }
}
