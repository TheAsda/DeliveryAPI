docker network create --driver bridge meganetwork
rem docker volume create --name=redisdata
docker run --name redis2 --network="meganetwork" -d -v redisdata:/data redis
rem docker volume create --name=neo4jdata
docker run --name neo4j2 --network="meganetwork" -d -v neo4jdata:/data -v d:/neo4j_plugins:/plugins -e NEO4J_dbms_security_procedures_unrestricted=apoc.\\\* -e NEO4J_AUTH=neo4j/test neo4j
rem docker network create --driver bridge elasticnetwork
rem docker volume create --name=elasticdata
docker run --name elastic2 --network="meganetwork" -d -v elasticdata:/usr/share/elasticsearch/data -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:7.4.2
rem docker run --link elastic:elasticsearch -d -p 5601:5601 docker.elastic.co/kibana/kibana:7.3.2
rem docker network create --driver bridge mongonetwork
rem docker volume create --name=mongodata
docker run --name mongo2 --network="meganetwork" -d -v mongodata:/data/db -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example mongo
rem docker run --name mongo-express -d -p 8081:8081 --network="mongonetwork" -e ME_CONFIG_MONGODB_ADMINUSERNAME=root -e ME_CONFIG_MONGODB_ADMINPASSWORD=example mongo-express
rem docker network create --driver bridge pgnetwork
rem docker volume create --name=postgresdata
docker run --name postgres2 --network="meganetwork" -d --hostname=postgres -v=postgres:/pgdata --env-file=pg-env.list crunchydata/crunchy-postgres:centos7-10.9-2.4.1
rem docker volume create --name=pgadmindata
rem docker run --name pgadmin -d -p 5050:5050 -v=pgadmindata:/var/lib/pgadmin --env-file=pgadmin-env.list --network="pgnetwork" crunchydata/crunchy-pgadmin4:centos7-10.9-2.4.1
docker run --name api -d -p 3000:3000 --network="meganetwork" -v d:/ips:/app/databases/ips api