docker volume create --name=redisdata
docker run --name redis -d -p 6379:6379 -v redisdata:/data redis
docker volume create --name=neo4jdata
docker run --name neo4j -d -p 7474:7474 -p 7687:7687 -v neo4jdata:/data -e NEO4J_AUTH=neo4j/test neo4j
docker volume create --name=elasticdata
docker run --name elastic -d -p 9200:9200 -p 9300:9300 -v elasticdata:/usr/share/elasticsearch/data -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.4.2
docker network create --driver bridge mongonetwork
docker volume create --name=mongodata
docker run --name mongo -d -p 27017:27017 --network="mongonetwork"  --restart=always -v mongodata:/data/db -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example mongo
docker run --name mongo-express -d -p 8081:8081 --network="mongonetwork" --restart=always -e ME_CONFIG_MONGODB_ADMINUSERNAME=root -e ME_CONFIG_MONGODB_ADMINPASSWORD=example mongo-express
docker network create --driver bridge pgnetwork
docker volume create --name=postgresdata
docker run --name postgres -d -p 5432:5432 --hostname=postgres -v=postgres:/pgdata --env-file=pg-env.list --network="pgnetwork" crunchydata/crunchy-postgres:centos7-10.9-2.4.1
docker volume create --name=pgadmindata
docker run --name pgadmin -d -p 5050:5050 -v=pgadmindata:/var/lib/pgadmin --env-file=pgadmin-env.list --network="pgnetwork" crunchydata/crunchy-pgadmin4:centos7-10.9-2.4.1
