## Base image
#FROM node:18
#
## Install LibreOffice
#RUN apt-get update \
#    && apt-get install -y libreoffice \
#    && rm -rf /var/lib/apt/lists/*

# Base image
FROM node:18-alpine

# Install LibreOffice and fonts
RUN apk update \
    && apk add --no-cache libreoffice ttf-dejavu ttf-droid ttf-freefont ttf-liberation \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn run build

# Set PATH environment variable to include LibreOffice
ENV PATH="/usr/bin:/usr/lib/libreoffice/program:${PATH}"

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
