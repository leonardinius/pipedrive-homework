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

## tl;dr Project and Structure Overview

This is [Express](https://expressjs.com/) based solution, with PostgreSQL as database back-end.
The [pg-promise](https://github.com/vitaly-t/pg-promise) is being used as database connector library, with built-in
Promise-s support, out of box.
The [node-pg-migrate](https://github.com/theoephraim/node-pg-migrate) is used to automate database incremental 
development, e.g. migrations. 

Please take a look into `migrations/` folder for database DDLs, classifiers, indexes etc..

The [Mocha](https://mochajs.org/) testing framework is used for Unit and Acceptance Testing, combined 
with [supertest](https://github.com/visionmedia/supertest) for REST in the tests (e.g. verifying response status 
codes and contents..).

See `test/` folder for more details and actual Unit and Acceptance tests definitions.

The high level structure of the project:

```
├── app.js                              // app entry point
├── db.js                               // database connection point
├── docker-compose.yml                  // PostgreSQL docker-compose definition
├── lib                                 // Various actions, serivices used from REST controllers
│   ├── Ingestible.js
│   └── ...
├── migrations                          // Database migration scripts
│   ├── 001_ddl-init-database.js
│   └── ...
├── package.json                        // Project dependencies
├── ...
├── restAPIs                            // Controllers, actions mounted to REST APIs
│   ├── queryNodes.js
│   └── ...
├── routes
│   ├── api.js                          // REST API mount point
│   └── index.js
├── sqls                                // SQLs used by controllers
│   ├── findByName.sql          
│   └── listRelationTypes.sql
├── ...
├── test                                // Unit and Acceptance Tests
│   ├── IngestibleTests.js
│   ├── SmokeAcceptanceTests.js
│   └── ...
├── ...
```

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

It should produce report similar to one seen below:

```
> yarn test                
yarn test v1.0.2
$ mocha --compilers js:babel-core/register

  Ingestible Tests
    Task sample data test
      ✓ We can get down to results from data

  Pageable Tests
    Pageable parsing parameters
      ✓ accepts string page
      ✓ accepts string pageSize
      ✓ accepts int page
      ✓ accepts int pageSize
    Pageable value ranges
      ✓ negative pages results to zeros
      ✓ negative page sizes results to 1
      ✓ Page +20000 results ok
      ✓ PageSize +20000 has cap (limit) to 100
    Limit, offset tests
      ✓ default values
      ✓ page 0, pagesize 10 => limit 10, offset 0
      ✓ page 3, pagesize 10 => limit 10, offset 30

  Acceptance Tests relying on database updates
    GET /api/nodes/:name/?page=&pageSize=
      ✓ Empty name results in 404 (315ms)
      ✓ Ignores case sensitivity
      ✓ Ignores extra spaces on start end
      ✓ Accepts pagesize parameters = 2
    POST /api/nodes
      ✓ Wipes previous data on POST
      ✓ Custom Data not from the task also works

  Smoke Acceptance Tests
    GET /api/relationTypes
      ✓ returns a list of all relation types
    POST /api/nodes
      ✓ Accepts empty array
      ✓ Fails on null input
      ✓ Accepts sample task data
    GET /api/nodes/:name/?page=&pageSize=
      ✓ Empty name results in 404


  23 passing (611ms)

✨  Done in 2.10s.
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

* I think the schema developed here will work good enough for 100K relations (still needs to be checked though).
  Even of it does not, there is a quick and easy way to optimize it for this workload:
  * create materialized view for both sides of relations (`left name`, `right name`, `left type name`, `right type name`)
  * create 2 indexes over the view (one for `left name` and another for `right name`) 
  * make the query with conditional `case` selects, so it will need to scan the index once
  ...
* In my experience PostgreSQL hums and performs well with such tasks on the N * 100K data set.

**1M nodes**

* Guess1: The solution outlined above (materialized view + indexes) could work fine as well, though might need 
  extra tuning. 
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
    Database transaction log, blocks on tables.
    
With the assumption that the write operations are rare, the medium size workloads should be fine. 

**100K**

* Guess2: with avg 1K per node in the request (e.g. to express relations to other nodes), it gives 
  us ~100MB of data to ingest.
  * It still could be done as single POST request however some care will be required.
  * The server will need tuning to allow bigger HTTP POSTS, more RAM and CPU.
  * The latency (response time) from the server will be considerably longer, the client will 
    need to be tuned to allow that.
 
It still should work, but (most likely) will sooner or later become fragile, clumsy and no one will 
want to touch it to not break it fully.

Having taken a peak view into Guess2, I would recommend to change the approach. 
It is clear the approach will not work well with **1M nodes**, so I will provide my suggestions there (see below).
 
**1M nodes**

I suggest to consider following changes: 
* Change exchange data format, e.g. from json to CSV or similar - in order to allow processing by
  portions of data, e.g. by lines. 
* Have client to upload the file (or files) to S3, Google Cloud, NFS, Share, etc..
* Passing only file(-s) identifier(-s) to the service.
* Service could then respond immediately, by putting the file processing workload into the 
  Enterprise Service Bus, RabbitMQ or alternatives (Queues, Batches..).
* Separate worker thread would then read (by parts, e.g. not whole file fully) file,
  perform traversal and analysis, cleaning and normalizing data for the insertion into the database.
  E.g. It may create separate `import_{{import_id}}_xxx` database tables and write data there.
* When the import process is nearly done, service does the following (in single transaction):
  * Drops actual data tables. 
  * Renames `import_{{import_id}}` tables to replace the ones dropped. 
* Service notifies the client  (api client) the import has been successful.
It could be implemented by web hook, queue event, import object status change etc..
