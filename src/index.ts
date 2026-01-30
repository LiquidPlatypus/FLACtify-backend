import fastify from "fastify";

import {prisma} from "./prisma.js";

const server = fastify();

server.get("/ping", async (request, reply) => {
	return "/pong\n";
});

server.get("/users", async() => {
	return prisma.user.findMany();
})

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});