# pull the base image
FROM node:12-alpine

# set the working direction
WORKDIR /app

COPY . .

RUN npm install

# start app
CMD ["npm", "start"]

EXPOSE 3000