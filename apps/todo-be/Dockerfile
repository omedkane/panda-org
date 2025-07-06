FROM oven/bun:latest

WORKDIR /app

COPY dist/apps/todo-be/ ./

RUN bun install

EXPOSE 3000

CMD ["bun", "main.js"]
