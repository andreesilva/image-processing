FROM  node:21-slim

RUN apt update && apt install -y openssl procps

RUN npm install -g @nestjs/cli

WORKDIR /home/node/app

COPY . . 
COPY ./.env.production ./.env

RUN npm install --quiet --no-optional --no-fund --loglevel=error


RUN npm run build


#USER node

EXPOSE 3000


#CMD tail -f /dev/null
#CMD [ "npm", "run", "start:dev" ]
CMD [ "npm", "run", "start:prod" ]
