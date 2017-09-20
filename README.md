See `task/BE_task.pdf`

## Init 

### Pre-requisites

* Docker (assumes via docker-machine)
```
brew install docker docker-machine docker-compose

docker-machine create -d virtualbox default
eval $(docker-machine env default)
```
* NodeJS, Yarn,.. 

```
brew install node
brew install yarn

yarn
```

### Environment variables

```
# Load environment variables
source .env
```

### Database

* Run PostgreSQL
```
docker-compose up -d
``` 

* Run DB migrations

```
node-pg-migrate up
```

## Development

* Run API server in JS reload mode

```
nodemon
```

* Fire up [http://localhost:3000/](http://localhost:3000/), explore & have fun