if [ -f .env ]; then
  export $(cat .env)
fi

docker build . --tag pbsctracker-api
docker run \
  -it --rm \
  --name pbsctracker-api-dev \
  -p 3000:80 \
  -v $(pwd)/src:/var/www/html/ \
  --network mariadb \
  -e MYSQL_HOST=${MYSQL_HOST} \
  -e MYSQL_USER=${MYSQL_USER} \
  -e MYSQL_PASS=${MYSQL_PASS} \
  -e MYSQL_DB=${MYSQL_DB} \
  -e CITY=${CITY} \
  -e TIMEZONE_CORRECTION=${TIMEZONE_CORRECTION} \
  pbsctracker-api
