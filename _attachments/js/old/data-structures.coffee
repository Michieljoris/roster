 # type can be: Person,Location,Shift,Generic
dbname='superblog'
# dbname='http://localhost:1234/roster'

shift =
  _id:"asdfashjk4h5jk52j34khjkl43"
  type:["Shift", ["personid", "locationid"]]
  working:
    weekly:[0,1,1,0,1,1,0]
    partofday:[[900,1200],[1230,1630]]
  sleepover:{}
  disturbedsleep:{}

person =
  type: ["Person", [[0, ["id1","id2"]]]]
  usecount:0
  award: [[0,{value:1}],[1234,{value:2}]]
  name:[[0,{value:"Sally"}], [124,{value:"Peter"}]]
  contactdetails:[[0,{ value:
        address:"1 Peter st"
        suburb:"Sub"
        ph: "123456dd"}]]


location =
  type: ["Location"]
  name: [[0,{value:"Runcorn"}]]

generic=
  _id:"id1"
  type: ["Generic", [[0,[]]]]
  name:[[0,{value:"Organisation wide defaults"}]]
  award: [[0,{value:2.1}]]
  early:[[0,
    value:0.15
    weekly:[0,1,1,1,1,1,0]
    partofday:[[600,830]]]]
  public_holidays:[[0,
    yearly:[[12,25],[12,26]]
    dates:[[2012,5,11]]]]
  weekday:
    weekly:[0,1,1,1,1,0]
  weekend:
    weekly:[1,0,0,0,0,0,1]

 generic2=
  _id:"id1"
  type: ["Generic", [[0,["id1"]]]]
  name:"Southside"
  early:[[0,
    partofday:[[500,830]]
   ]]

attribute=
  value:"blabla" #optional
  partofday:[[600,830]]
  weekly:[0,1,1,1,1,1,0]
  intervals:[[121341243,1233423432]]
  yearly:[[12,25],[12,26]]
  dadtes:[[2012,5,1]]



# Pouch "idb://" + dbname, (err, db) ->
# Pouch "http://localhost:5984/" + dbname, (err, db) ->
#     console.log err
#     db.post person, (err, info) ->
#       console.log err


# Pouch.replicate 'idb://' + dbname, 'http://localhost:1234/' + 'roster', (err, changes) ->
# 		# console.log err
# 		# console.log changes
# 		# console.log "replicated??"

class Data
  constructor: () ->


class Person extends Data
  constructor: (@inherited, @attributes) ->


class Location extends Data

class Shift extends Data


class Attribute
