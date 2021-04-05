# Dockerfile

# base image
FROM node:12.22.0-alpine

# create & set working directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# copy source files
COPY . /usr/app

# install dependencies
RUN npm install

# start app
RUN npm run build
EXPOSE 8081
CMD ["npm", "start"]