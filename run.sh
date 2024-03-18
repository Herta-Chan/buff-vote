#!/bin/bash

while true; do
    node index.js &

    pid=$!

    sleep 10

    kill $pid

    wait $pid
done
