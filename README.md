## BabylonJS Editor Service

- Docker run minio
``` docker
docker run -p 9000:9000 -d -p 9001:9001 -e "MINIO_ROOT_USER=babylonjseditor" -e "MINIO_ROOT_PASSWORD=CTwNR9Zd4m" quay.io/minio/minio server /data --console-address ":9001"
```
