#!/bin/bash

# Start and end dates
start_year=2013
start_month=1
end_year=2025
end_month=3

current_year=$start_year
current_month=$start_month

while [ $current_year -lt $end_year ] || ([ $current_year -eq $end_year ] && [ $current_month -le $end_month ])
do
    formatted_month=$(printf "%02d" $current_month)
    filename="lichess_db_standard_rated_${current_year}-${formatted_month}.pgn.zst"
    url="https://database.lichess.org/standard/$filename"
    output_file="${current_year}-${formatted_month}.pgn"
    echo "Downloading: $url..."
    curl -L -O -r 0-250000000 "$url"
    echo "Unzipping: $filename to $output_file"
    unzstd "$filename" --stdout > "$output_file"
    rm $filename
    echo "Processing completed for $current_year-$formatted_month"

    current_month=$((current_month + 1))
    if [ $current_month -gt 12 ]
    then
        current_month=1
        current_year=$((current_year + 1))
    fi
done