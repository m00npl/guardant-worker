#\!/bin/bash

echo "Aktualizuję regiony w serwisach na właściwe..."

ssh ubuntu@moon.dev.golem.network 'bash -s' << 'REMOTE'
# Pobierz wszystkie serwisy
SERVICES=$(docker exec guardant-redis redis-cli --scan --pattern "service:*:*" | grep -v ":checks")

for SERVICE_KEY in $SERVICES; do
    echo "Sprawdzam $SERVICE_KEY"
    
    # Pobierz serwis
    SERVICE=$(docker exec guardant-redis redis-cli GET "$SERVICE_KEY")
    
    if [ -n "$SERVICE" ]; then
        # Zamień stare regiony na nowe
        UPDATED=$(echo "$SERVICE" | sed \
            -e 's/"ap-northeast-1"/"asia-northeast"/g' \
            -e 's/"eu-north-1"/"eu-north"/g' \
            -e 's/"eu-central-1"/"eu-central"/g' \
            -e 's/"eu-central-2"/"eu-east"/g' \
            -e 's/"us-east-1"/"us-east"/g' \
            -e 's/"us-west-1"/"us-west"/g' \
            -e 's/"ap-southeast-1"/"asia-pacific"/g' \
            -e 's/"eu-west-1"/"eu-west"/g')
        
        # Zapisz zaktualizowany serwis
        echo "$UPDATED" | docker exec -i guardant-redis redis-cli SET "$SERVICE_KEY" -
        echo "Zaktualizowano $SERVICE_KEY"
    fi
done

echo "Restart schedulera..."
docker restart guardant-scheduler

echo "Gotowe\! Regiony zostały zaktualizowane."
REMOTE
