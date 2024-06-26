FROM node:14.17.1-alpine3.13
WORKDIR /app
COPY ["package.json", "./"]
COPY . .
RUN npm install
EXPOSE 8000
ENV PORT=8000
ENV DATABASE=mongodb://localhost:27017/BDCatastro
ENV DNS_FRONT=http://localhost:5000
ENV TOKEN_SECRET=1a2ffe36502bc61066c571867b7f458c
ENV NODE_ENV=Desarrollo
CMD ["npm", "start"]