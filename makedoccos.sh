#docker -o ../docs -c manni -s yes -I -u -x node_modules -w --extras fileSearch
#docker lib/utils.js -o doccos -I -u -w  --extras fileSearch
docker js/timesheet_canvas.js lib/utils.js lib/vow.js -o doccos -I -u  --extras fileSearch

