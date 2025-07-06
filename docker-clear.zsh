docker ps -a --filter "name=todo-be" -q | xargs docker rm -f
docker rmi todo-be-app:latest
docker volume ls -q | grep '^todo-be' | xargs -r docker volume rm
docker builder prune -a
