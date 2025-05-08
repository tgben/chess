#!/bin/bash

# Start and end dates
start_year=2013
start_month=1
end_year=2013
end_month=08

current_year=$start_year
current_month=$start_month

while [ $current_year -lt $end_year ] || ([ $current_year -eq $end_year ] && [ $current_month -le $end_month ])
do
    formatted_month=$(printf "%02d" $current_month)
    pgn_file="${current_year}-${formatted_month}.pgn"
    current_month=$((current_month + 1))
    if [ $current_month -gt 12 ]
    then
        current_month=1
        current_year=$((current_year + 1))
    fi
done