assumptions
structure
orm?

100K, 1M relations

performance tests?

## Task

See `task/BE_task.pdf`

## How-to 

### Pre-requisites

* Docker (assumes via docker-machine)
```
brew install docker docker-machine docker-compose

docker-machine create -d virtualbox default
docker-machine start default
eval $(docker-machine env default)
```
* NodeJS, Yarn,.. 

```
brew install node
brew install yarn
```

### Dependencies

Dependencies are managed by Yarn.
Run the following:
```
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
pg-migrate up
```

## Development

### Run tests

At the moment of writing there are several Unit Test suites and several Acceptance Test suites.
See at the `test/` directory.

To run the full test suite use the following command:
```
yarn test
```

### Run API server

```
yarn dev
# or use `yarn debug` with debug logs on
```

* Fire up [http://localhost:3000/](http://localhost:3000/), explore & have fun