FROM oven/bun:latest

WORKDIR /app

COPY dist/apps/uglyapp-be/ ./

RUN bun install

EXPOSE 3128

CMD ["bun", "main.js"]
