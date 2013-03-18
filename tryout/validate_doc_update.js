// {
// "validate_doc_update" :
// }
function(newDoc, oldDoc, userCtx, secObj) {
    var type = 'shift';
    var dbname = 'waterfordwest';
        
    var has_db_rw= function(userCtx, secObj) {
        // see if the user is has write permissions as specified by
        // role type-rw
        for(var idx = 0; idx < userCtx.roles.length; idx++) {
            var user_role = userCtx.roles[idx];
            if(user_role === dbname+'-rw' || user_role === 'all_houses-rw') {
                return true; // role matches!
            }
        }
        return false; // default to no type admin
    };
        
    if (!has_db_rw(userCtx, secObj)) {
        throw({unauthorized: 'Only users with the ' + type + '-rw role assigned can update this database'});
    }

    if ((oldDoc && oldDoc.type !== type) || newDoc.type !== type ) {
        throw({forbidden : 'doc.type must be ' + type});
    } // we only allow type docs 
    if (type === 'shift')
        if ((oldDoc && oldDoc.location !== dbname) || newDoc.location !== dbname ) {
            throw({forbidden : 'doc.location must be ' + dbname});
        }
}
