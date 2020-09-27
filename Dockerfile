# Pull from docker hub, image name: "node", version: "12"
FROM node:12

# Working directory for the application
WORKDIR /usr/src/app

# Install application dependencies
# Copies both package.json and package-lock.json
COPY package*.json ./

RUN npm install

# Bundle the source code and put into container
COPY . .

# Expose a port to bind to for the application
EXPOSE 8080

# The command used to run the application. [${executable}, ${arguments} ...]
CMD ["node", "index.js"]