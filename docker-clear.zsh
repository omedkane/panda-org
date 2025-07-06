docker ps -a --filter "name=uglyapp-be" -q | xargs docker rm -f
docker ps -a --filter "name=panda-org" -q | xargs docker rm -f
docker ps -a --filter "name=uglyapp-be" -q | xargs docker rm -f
docker rmi uglyapp-be-app:latest
docker rmi panda-org-app:latest
docker volume ls -q | grep '^uglyapp-be' | xargs -r docker volume rm
docker volume ls -q | grep '^uglyapp-be' | xargs -r docker volume rm
docker volume ls -q | grep '^panda-org' | xargs -r docker volume rm
docker builder prune -a
