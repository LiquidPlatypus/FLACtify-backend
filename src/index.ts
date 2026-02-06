import fastify from "fastify";

import {PrismaClient} from "../generated/prisma_client/client";
import {PrismaPg} from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const server = fastify();
const prisma = new PrismaClient({
	adapter,
});

server.get("/", async (req, res) => {
	const userCount = await prisma.user.count();
	res.send(
		userCount == 0
			? "No users have been added yet."
			: "Some users have been added to the database."
	);
});

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});