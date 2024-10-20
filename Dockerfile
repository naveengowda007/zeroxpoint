FROM node:14 AS ui-build
WORKDIR /usr/src/app
COPY Website/ ./Website/
RUN cd Website && npm install && npm run build

FROM node:14 AS server-build
WORKDIR /usr/src/app
COPY Backend/ ./Backend/
RUN cd Backend && npm install

FROM node:14
WORKDIR /usr/src/app/
COPY --from=server-build /usr/src/app/Backend/ ./
COPY --from=ui-build /usr/src/app/Website/build ./Website/build
RUN ls
EXPOSE 3001
EXPOSE 3000
CMD ["/bin/sh", "-c", "cd /usr/src/app/ && npm start"]
