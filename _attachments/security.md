#Roster app and security
--------------

With security I mean accessibility and writability of data. The app
itself is unsecured. A client side permission based system was planned
but because it is relatively easy to bypass it has not been
implemented.

###Internal database

Data comes from a database. This database can be internal or
external. When the app runs against the internal database basic
authentication of a user is performed by comparing the hash of their
password to a hash in a document stored under their user name. Since
this comparison is done in plain javascript in the browser again this
can be easily bypassed. Internal database role based authorisation can
be implemented but has not been done yet.

When data is stored internally security comes from securing access to
the computer where the browser is installed or running. The advantage
of an internal database is that the app and database are portable. You
can run the browser of a usb stick and use the app and the data on any
computer. The internal database has all the capabilities of any
appropriate external database, except for security features. Since the
app is using a database called CouchDb that means the internal
database can automatically synchronize with other (CouchDB) databases
on a network whenever there is connectivity. Note that the capability
is there but the interface to easily manage it has not been
implemented yet.

###External database

The other source of data is external CouchDB instances running on an
accessible network. This network can be local on the computer where
the browser is running, on an intranet or on the internet. A CouchDB
instance can be secured with a industry standard level set of security
features (see for more info
[Security_Features_Overview](http://wiki.apache.org/couchdb/Security_Features_Overview)),
which the app is making full use of.

Read access can only be controlled on a database by database
basis. Once a user has been granted read access to any document in a
database he can read automatically all the documents. However write
access control is much more granular and can be granted on a document
by document basis.

####User databases

The main feature of CouchDB is reliable replication of its data from
one instance to another across a network. Because networks are not
guaranteed to be connected at all times CouchDB databases are designed
to operate independently from each other till they are able to
synchronize their data again. Because any given instance by design has
no guaranteed access to a central user database every instance needs
to maintain its own user database and it will authenticate and
authorise users based on information contained in it.

Because every instance maintains its own user database it can also
decide for itself which databases it allows to be read and which
documents it allows to be written to. This allows for building a
collection of instances or groups of instances organised
hierarchically by completeness or importance of data. Every new
instance only gets as many write and read rights to the instance it
wants to sync with as the installer/owner of the instance has,
assuming he uses his own credentials to set up the replications. Of
course he has still full access to his own instance, since he is the
server admin.

####Sharing the user database

Assuming we want any user to be able to log in to any CouchDB instance
and be assigned proper permissions we will have to somehow sync up the
separate user databases to some degree, and this is where the security
trade offs will have to be made. 

####Options:

User databases can be replicated from instance to instance like any
other database, however the lower in the 'hierarchy' the instance is
to which the user database get replicated, the more exposed it
potentially is. Lower in the hierarchy means an instance setup by
someone with fewer permissions, having possibly only read access to
one single low security database.

To limit the exposure of the user database we could flatten the
hierarchy by mandating that databases can only be replicated to an
other instance installed and configured by someone with at least as
many rights as the server admin or the original database. But this is
compromising somewhat the distributed nature of CouchDB, since an
actual person would have to administer separate instances, and people
would have to give up full access to software running on their own
computer, since the CouchDB instance will be locked down by a central
admin.

Another option is to rebuild and maintain a separate user database
for every instance. This means that every user will have to setup
their password for every single instance, and that the owner of the
instance will have to maintain it as a server admin himself.

So the choice is between exposing the user database, flatten the
hierarchy or rebuilding it per instance. Each approach on its own is
straight forward and easy to implement, however they could be combined
to some degree. This would bring a lot of complexity to the system
though. How do you decide which instances get controlled by the
central admin? Would people let you? When replicating user databases
you wouldn't have to replicate all of the users, but how do you decide
which are too sensitive to expose? Also you would have to assign roles
to people describing what other users they are allowed to replicate
etc. If you partially replicate user databases how does a server admin
know who is and who isn't is in his database? What if you need to
setup a new instance but the central admin is not available? Or even
worse, he forgot or lost his password? 

####Choices are made

Complex systems, unless fully understood are by definition not secure,
 a simple system on the other hand, as long as we understand its
 limitations can be made very secure. 

The nature of CouchDB is that it is a distributed database. This is an
appropriate database to use in a world more and more connected through
networks and the internet.  The same data should be and is available
at different locations at the same time. But networks are sometimes
disconnected. CouchDB is designed with this fact in mind. User
databases should be distributed as well, and synchronized when
possible. There is however one really strong argument against
distributing this particular database and thus increasing the risk of
its exposure, which is that you risk exposing users' encoded
passwords.

####Attack

Passwords normally do not get stored in an authenticating database in
clear text but in encoded form called a hash. Depending on the hash
method it can be very difficult to reverse the encoding, that is to
change to hash back into the password. When a user logs on the server
it simply hashes the entered password and compares that with the
stored hash. When a user database is exposed a potential cracker will
not find any passwords but he will have full access to the hashes,
hashing method used and any other relevant data necessary to
authenticate a user. An offline attack can begin, that is he doesn't
even have try to log in anymore to test passwords. He can do it in his
own time on his own (super) computer.

User databases cannot be fully secured against potential crackers, and
indeed every so often they get compromised. The cracker can then try
every possible password one after the other, or he can use precomputed
tables of passwords and hashes. The first approach can take an awful
lot of time, the second can take up an awful amount of memory. However
a password like 'briansmith' is instantly crackable and 'ScoRpi0ns'
only takes a few minutes. 

####Defense

Any attack by a cracker can be defeated by a sufficiently complex
password, for instance 'rWibMFACxAUGZmxhVncy' might take centuries to
crack. 

Second you can prevent crackers from using precomputed tables by
including a salt when calculating the hash of a password. They will be
forced to use brute force or dictionary attacks. 

Third to make brute force or dictionary attacks cumbersome you can
force a hashing method to be slow in computing a hash. Since an
authenticating server might do a few to possible a few hundreds or
thousands of authenticating hashing per minute, a cracker will want to
calculate a hashes in the order of millions or more per minute. A
calculation that takes 20 ms will not affect the user's experience of
logging in very much but it will seriously slow down a cracker's
calculation.

There is a fourth defense. The original user database doesn't actually
get shared, it only gets written to, either directly or replicated
from another local (at the same CouchDB instance) database. What gets
replicated and synced with other instances is that local replica of
the user database. If a user really wants to protect their password
and not expose its hash they can write directly to the user database
(everyone has access to their own records). They can use the CouchDB
internal manager or use [quilt](http://localhost:8081). They will then
have to refrain from using the roster app to update their password
otherwise it will get shared again. They can use the password update
of the roster app at other instances as long as that instance doesn't
not have permission to update users' passwords, since it will get
written to the original instance again and update its user database.

Another way to localize users is tag them as such. These users do not
get replicated from instance to instance, and only get replicated to
the local user database (not implemented yet).

####Implementation

First of all the roster app and the connection to the database on the
internet are over a certified SSl connection, preventing anybody from
snooping on the data while in transit and from spoofing the site and
database as long as Go Daddy Secure Certification Authority can be
trusted (and I think it can).

The roster app and CouchDB are configured to use the PBKDF2 method
with an iteration of 100000 (slowing calculations down), a salt of 64
chars (preventing rainbow tables from being used) and the user is
forced to input a password of reasonable complexity.

There is at least one server admin per CouchDB instance. They are the
only one that can read any database, write to any (user) database
(database validation allowing), setup replications and setup roles for
databases.  

All users start out by having no permissions at all. They are then
given permissions by assigning roles to them. If any of these roles
have been assigned to a particular database as well they will
unlimited read access to it. In practice all databases will have the
following roles:

    read 
	write 
	read-[database name]
	write-[database-name]

A user assigned the role of 'read' will have read access to all
regular databases. A user assigned 'read-db1' and 'write-'db2' will have
read access only for the databases 'db1' and 'db2'.

More roles can be assigned to group databases by region for instance.

If you assign any kind of write role to a user they will get read
access, and preliminary write access. You will then have to assign
more roles to the user describing what they are actually allowed to
write. Without the appropriate write role they are not allowed to
write at all however.

These roles are of the format:

	allow_[dbname]_[fieldname:value], [fieldname2:value],.. | [NOT|ONLY]  [fieldnames..]
	
So for instance:

	allow_db1_type:'location' | NOT costCode

A user with this role assigned can only write to database db1
(providing he has write permission for db1) and only documents with a
field type equal to 'location' as long costCode is not updated.

You can add more fields value pairs to the left of the | and more
fields to the right.

The database name can be replaced with a * and allows writing to any
database. The value of a field can be replaced with user (no quotes)
to identify the user trying to write.

A few more examples:

Allows any document to be written to any database:

	allow_*_
	
Allows any document to be written to db1 as long as only the address field
gets updated:
	
	allow_db1_|ONLY address
	
Allows only documents with type 'person' to be written:

	allow_db1_type:'person'
	
Allows a user  to update its own credentials, but nothing more:

	allow_*_type:'user', _id:user|ONLY derived_key
	
A similar system of describing documents is applied to databases to
prevent the wrong type of document to be written to it no matter who
does the writing, but this will not have to edited very often. 

This permission system is flexible enough to allow users to be setup
as readers of one or more databases, to give selective write
permissions to for instance replicate and sync a particular database
and to give full or near full access to managers for instance while
still protecting the integrity of databases.


####In practice

There is a central (backed up by replicas perhaps) instance holding
 separate databases for locations, persons and users. There are also
 separate shift databases, one for every location.
 
Any user can go to
[multicap.iriscouch.com](http://multicap.iriscouch.com) and play
around in the app since by default it works against the internal database.
