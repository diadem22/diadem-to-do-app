dockek build -t diadem27/to-do-app:latest -f ./app/Dockerfile ./app
docker push diadem27/to-do-app:latest
kubectl apply -f app/k8s
kubectl set image deployment.apps/web-deployment server=diadem27/to-do-app:latest