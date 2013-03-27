function(newDoc, oldDoc, userCtx, secObj) {
    "use strict";
    var dbname = 'waterfordwest';
        
    var has_db_rw= function(userCtx, secObj) {
        // see if the user is has write permissions as specified by
        // role type-rw
        // log(userCtx);
        for(var idx = 0; idx < userCtx.roles.length; idx++) {
            var user_role = userCtx.roles[idx];
            if(user_role === dbname+'-rw' || user_role === 'all_houses-rw' || user_role === '_admin') {
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
    
    if ((oldDoc && oldDoc.type !== 'shift' && oldDoc.type !== 'location') || (newDoc.type !== 'shift'  && newDoc.type !== 'location')) {
        throw({forbidden : 'type must be ' + 'shift' + ' or location'});
    } // we only allow type docs 
    
    if ((oldDoc && oldDoc.type === 'location' && oldDoc._id !== dbname) || (newDoc.type === 'location' && newDoc._id !== dbname )) {
        throw({forbidden : 'If type is location, the id has to be ' + dbname});
    }
        
    if ((oldDoc && oldDoc.type === 'shift' && oldDoc.location !== dbname) || (newDoc.type === 'shift' && newDoc.location !== dbname) ) {
        throw({forbidden : 'location must be ' + dbname + ' for all docs of type shift'});
    }

}
