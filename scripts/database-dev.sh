if [ ! "$(sudo docker ps -q -f name=rethinkdb-dev)" ]; then
    # if docker exited, cleanup
    if [ "$(sudo docker ps -aq -f status=exited -f name=rethinkdb-dev)" ]; then
        sudo docker rm rethinkdb-dev
    fi

    # run your container
    sudo docker run --name rethinkdb-dev -d \
        -p "38881:8080" -p "38882:28015" -p "38883:29015" \
        -v $PWD/rethinkdata:/data \
        rethinkdb:latest
fi
