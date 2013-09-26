Roster 
--------
At the moment a roster and shift management software, using CouchDB as
the backend.

The thing is designed really to be backend agnostic and extendable by
plugin views, even plugin types and their editors.

But at the moment works against CouchDB and has the only the following
types (and their editors): shift, location, person, settings, user. 

And the following views of data: table, calendar and time sheet.

The framework used to hold the frontend UI together is SmartClient. 

It uses my [bootstrapjs](https://github.com/Michieljoris/bootstrapjs)
to organize the whole in modules to keep the complexity down.

The challenge I set my self was to not use any server code and run the
app straight of CouchDB as a couchapp, but still have proper role
based authentication and role based setting up of replications of
databases, this is working thanks to my [validate_doc_update](https://github.com/Michieljoris/validate_doc_update).

The app runs equally well using the in browser database (pouchdb) or
and external Couchdb instance.

To help people set up a CouchDB instance I wrote
[quilt](https://github.com/Michieljoris/quilt), it configures and sets
up all the necessary replications for them. It is also a generic
CouchDB manager a la futon.

The idea is to have a decentralized but hierarchical group of CouchDB
instances against which the app can work, see my
[blurb](https://github.com/Michieljoris/roster_help/blob/master/build/markdown/security.md)
on security. 

In the end staff can view their upcoming shifts online, bosses can
manipulate them, and management can have an overview and collate all
the data easily.

SmartClient is a bit cumbersome and it would be nice to rewrite the
app using no frameworks. Especially the calendar gets a bit sluggish.



