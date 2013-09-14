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
can run the browser off a usb stick and use the app and the data on any
computer. The internal database has all the capabilities of any
appropriate external database, except for security features. Since the
app is using a database called CouchDb that means the internal
database can automatically synchronize with other (CouchDB) databases
on a network whenever there is connectivity. Note that the capability
is there but the interface to easily manage this last feature has not been
implemented yet.

###External database

The other source of data can be external CouchDB instances running on an
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
change the hash back into the password. When a user logs on the server
,the server simply hashes the entered password and compares that with the
stored hash. When a user database is exposed a potential cracker will
not find any passwords **but** he will have full access to the hashes,
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
calculate hashes in the order of millions or more per minute. A
calculation that takes 20 ms will not affect the user's experience of
logging in very much but it will seriously slow down a cracker's
calculations.

There is a fourth defense. The original user database doesn't actually
get shared, it only gets written to, either directly or replicated
from another local (at the same CouchDB instance) database. What gets
replicated and synced with other instances is that local replica of
the user database. If a user really wants to protect their password
and not expose its hash they can write directly to the user database
(everyone has access to their own records). They can use the CouchDB
internal manager or use [quilt]. They will then
have to refrain from using the roster app to update their password
otherwise it will get shared again. They can use the password update
of the roster app at other instances as long as that instance doesn't
have permission to update users' passwords, since it will get written
to the original instance again and update its user database.

Another way to localize users is to tag them as such. These users do not
get replicated from instance to instance, and only get replicated to
the local user database (not implemented yet).

####Implementation

First of all the [roster] app and the connection to the [database][database] on the
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
field type equal to 'location' as long as costCode is not updated.

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

#####Architecture
There is a central (backed up by replicas perhaps) instance holding
 separate databases for locations, persons and users. There are also
 separate shift databases, one for every location. This can be at
 [iriscouch.com](http://www.iriscouch.com) or at a VPS like AWS or
 Linode or anywhere else you can install and control a CouchDB
 instance. You can install it on your own network and open the proper
 port to the wider internet. In all but the first case you will have
 to buy and install ssl certificates to enable verification of the
 identity of your instance (You will want the little green lock in the
 address bar of browsers when users use the app or access the
 database). All these other instance will be able to replicate from
 and to the any central or for that matter any other instance. What
 they exactly are able to replicate and write back will depend on the
 credentials that are available to the installer of the 2nd tier
 instance and the roles and permissions granted to these credentials.
 
Any user can go to the [roster] website and play
around in the app since by default it works against the internal
database. In future users will be able to replicate and sync data from
an external database directly with this internal one, and have this
data persist across restarts of the browser and computer but for now
the user will have to log on to a CouchDB instance to have this
happen. If there is lag or the connection is unreliable because
the CouchDB instance is running on the internet they can install a
local instance and synchronize that with the remote instance and have
the app work against the local instance. 

#####Changing of permissions
Because the source of data is ultimately the central database (or
central cluster) and users will have to authenticate against this
database to contribute or read any new data allocation of permissions
can be done centrally. As the status of employees changes over time
(not employed, employed, manager, admin etc) appropriate permissions
can be added and removed. Of course any data already replicated to
users' local instances can not be removed but users could have copied
that data by any other means already anyway.

#####Changing passwords

If a password gets compromised a user can change this himself using
the roster app or somebody with the right permissions can do it for
him. This new password then gets replicated across all instances of
CouchDB, so that means this user can log in with the same credentials
at any location or from any computer. It this user is maintaining a
local instance he will have to change the credentials used to setup
the replications for this instance as well. If a user does not want
his password hash exposed he can change it in the a central user
database directly, and again if he maintains a local database he will
to update the credentials used. If he accesses the data via a local
instance maintained by someone else he will have to use the old
password since no user data gets replicated *out* of the central user
database only *in*. If he updates this out of sync password in the
roster app the password might be synchronized again across all
instances. If a user does not want to expose their hash he can adopt
this strategy however if he is that worried he is better off using
a single but very strong and unique (compared to any other passwords
he might be using elsewhere) password. It greatly eases administration
of users' credentials.

#####Groups of users
I imagine there are 3 groups of users. The first group consists of
people that want to check up on the roster to see when their shifts
are on. These people will log in using their user name and password
either at home or where they work. They will not be able to update or
write any data back to any database, except for perhaps to update
their own password. The bulk of people will be in this group. Any
person might have read access to more than one house at the time.

The second group would be maintainers of local 2nd tier databases,
people like team leaders at the houses, coordinators, anybody that
decides on who works when. These people will be able to add and update
shifts, but not any other type of data except perhaps their own user
data. If they need to add staff to their database but the central
database has not yet been updated or internet connectivity is down ,as
a temporary fix they can add and a new user as long as he is tagged as
local. Once the central staff/user database has been updated they will
have to update the shifts where the user was employed and start using
the official user information. People in this group might have write
permission to one house database or multiple house databases. Since
they maintain and control their own instance of CouchDB they can
configure it however they like, but for ease of installation they
should use [quilt]. I've tried to make this as easy as possible and in
a typical situation this should be a 3 or 4 click affair. 

The third group will be people that maintain central user and location
databases. These people will be able to update anybodies' password,
assign and remove any users' roles. It is advisable for them to use a
strong password and they need to be trusted since they will be able to
modify any data in any database except the replicator database. 

There will also will have to be 1 or 2 people with server admin
credentials to a central database for general trouble shooting and/or
to add more (house) databases to the system and then configure them
properly. This sounds complicated but is really only a couple of
clicks affair using a tool like [quilt].

###Networking is optional 

It is important to understand that the networking of the instances of
CouchDB is optional. Anybody can setup and use the [roster] app
independently from any other instances. For that matter they don't
even need to set up a local instance of CouchDB and can use the
[roster] app as it comes down to their browser. They can add
locations, persons, shifts and even have quasi authentication for any
persons they want to share the app with. They can then print out
summaries, time sheets, calendars, perform queries etc based on the
data entered.If the data needs to be shared it can be replicated to an
external instance. Or they can setup their own instance to start off
with and implement their own role based permission system.

However if people want the benefit of centrally managed user, location
and shift database they can hook in to an established network of
instances. But this hook can at any time be released (by cancelling
all replications) or connected again (by reconfiguring the
replications). By unhooking no data gets sent back to the central
database either though.

One last thing: the default user is 'guest' with password
'guest'. This user will always be present in the user database and if
removed the roster app will try to add it again to the user database
if necessary. When kick starting a new system of networked instances
this user will have to given full permissions by a server admin, but
when hooking up a local instance to a wider network this user will
have no or very little permissions assigned to him. At the very least
his password should not be 'guest' anymore.

[quilt]: http://quilt.michieljoris.com
[roster]: http://multicap.iriscouch.com
[database]: http://multicapdb.iriscouch.com
