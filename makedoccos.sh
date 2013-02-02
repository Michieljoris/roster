#docker -o ../docs -c manni -s yes -I -u -x node_modules -w --extras fileSearch
#docker lib/utils.js -o doccos -I -u -w  --extras fileSearch
docker js/views/timesheet/multicap_timesheet_raphael.js\
 lib/utils.js\
 lib/vow.js\
 lib/logger.js\
 js/main.js\
 js/layout.js\
 -o doccos -I -u  --extras fileSearch










