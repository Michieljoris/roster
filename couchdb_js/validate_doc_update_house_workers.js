function(newDoc, oldDoc, userCtx, secObj) {
    "use strict";
    var dbname = 'waterfordwest';
        
    var has_db_rw= function(userCtx, secObj) {
        // see if the user is has write permissions as specified by
        // role type-rw
        // log(userCtx);
        for(var idx = 0; idx < userCtx.roles.length; idx++) {
            var user_role = userCtx.roles[idx];
            if(user_role === dbname + '-rw' || user_role === 'allhouses-rw' ||
               user_role === 'persons-rw' || user_role === '_admin') {
                return true; // role matches!
            }
        }
        return false; // default to no type admin
    };
        
    if (!has_db_rw(userCtx, secObj)) {
        throw({unauthorized: 'Only users with the ' + dbname + '-rw role assigned can update this database'});
    }
    
    if (newDoc._deleted === true) {
        // allow deletes by admins and matching users
        // without checking the other fields
        return;
    }
    
    if ((oldDoc && oldDoc.type !== 'person' && oldDoc.type !== 'settings') || (newDoc.type !== 'person'  && newDoc.type !== 'settings')) {
        throw({forbidden : 'type must be person or settings doc'});
    } // we only allow type person and settings docs 
    
    if ((oldDoc && oldDoc._id === 'guest') || (newDoc._id === 'guest')) {
        throw({forbidden : 'guest user can not be saved in this database'});
    } // we only allow type person and settings docs 
    
    if ((oldDoc && oldDoc.type === 'settings' && oldDoc.lastEditedBy === 'guest') || (newDoc.type === 'settings' && newDoc.lastEditedBy === 'guest')) {
        throw({forbidden : 'guest user\'s settings can not be saved in this database'});
    } // we only allow type person and settings docs 

}
