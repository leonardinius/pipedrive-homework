# Task

See `task/BE_task.pdf`

# Assumptions

* Service ir READ intensive (search by name).
* WRITE operations are relatively rare, and could be not optimized for.
* WRITE operation could purge all the data from the database, and then insert new data.
* Service needs to be developed & maintained LTS (long term support), hence the unit and acceptance tests. 

# Disclaimers

* I am not proficient JS developer, hence do not expect idiomatic JS code or project structure (e.g. best practices).
* I am not well familiar with NodeJS ORM (Object Relationship Manager) space, so stuck to the thing I know well - SQL.

# Part 1 & 2: Service Endpoints

## How-to Run locally

### Pre-requisites

* Docker (assumes via docker-machine, docker-compose)
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

Note: it expects the `docker-machine start default` has been already executed.
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

### Run App (API) server

```
yarn dev
# or use `yarn debug` with debug logs on
```

* Fire up [http://localhost:3000/](http://localhost:3000/), explore & have fun

# Part 3: Performance, 100K, 1M relations

Usually I try to not guess if I can easily check, e.g. by generating sample data set and using JMeter.
Unfortunately I have not enough time to complete it here fully, so here are my best guesses.

## READs

**100K**

* I think the schema I developed here will work good enough for 100K relations (still needs to be checked though).
  Even of it does not, there is a quick and easy way to optimize it for this workload:
  * create materialized view for both sides of relations (`left name`, `right name`, `left type name`, `right type name`)
  * create 2 indexes over the view (`left name`, `right name`) 
  * make the query with conditional `case` selects, so it will need to scan the index once
  ...
* In my experience PostgreSQL hums and performs well with such tasks on the N * 100K data set.

**1M nodes**

* Guess1: The solution outlined above might work fine as well, though might need extra tuning. 
  I have seen PostgreSQL executing more complex queries with no extra fuss about it.
* If Guess 1 will not be the case, the different approach should be taken. 
  I would investigate whether graph databases (e.g. Neo4J) or in memory databases can be used 
  to store the relations (graph) and efficiently query the dataset. 

## WRITES

* With the current approach the WRITES are the most expensive (CPU, TIME) and less scalable operation.
* First of all - the endpoint receives input graph as a whole; and processes it as a whole. 
  This will not work well with bigger data sets:
  * RAM to ingest and process the dataset.
  * CPU to deserialize and iterate over the data (processing power).
  * Whole data set should be written in one single transaction. 
    Database transaction log, block on tables.
    
With the assumption that the write operations are rare, the medium size workloads should be fine. 

**100K**

* Guess1: with max 1K per node in the request (e.g. to express relations to other nodes), it gives 
  us ~100MB of data to ingest.
  * It still could done as single POST request however extreme care will be required.
  * The server will need tuning to allow that big HTTP POSTS, lots of RAM and CPU given.
  * The response from the server will be very long, the client will need to be tuned to allow that.
 
Having taken a peak view into Guess1, I would recommend to change the approach. It still might work, 
but (most likely) will become fragile, clumsy and no one will want to touch it to not break it fully.

It is clear the approach will not work well with **1M nodes**, so I will provide my suggestions there (see below).
 
**1M nodes**

The recommended approach:
* Change exchange data format, e.g. from json to CSV or similar, e.g. in order to allow processing by
  portions of data, e.g. by lines. 
* Have client to upload the file to S3, Google Cloud, NFS, Share, etc..
* Passing only file identifier to the service
* Service could then respond immediately, by putting the file processing workload into the 
  Enterprise Service Bus or alternatives (Queues, Pipes..)
* Separate worker thread would then read (by parts, e.g. not whole file fully) file,
  perform traversal and analysis, cleaning and normalizing data for the insertion into the database.
  E.g. It may create separate `import_{{import_id}}` database tables and write data there.
* When the import process is nearly done, it in single transactions does the following:
  * Drops actual (current) database tables. 
  * Renames `import_{{import_id}}` to replace the ones dropped. 
* Service notifies the client the import has been successful.
