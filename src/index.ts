import fastify from "fastify";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";

import { requireEnvs } from "./utils/env.js";

// @ts-ignore
import { PrismaClient } from "../generated/prisma_client/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { userRoutes } from "./modules/user/user.route.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const server = fastify();
const prisma = new PrismaClient({ adapter });

server.decorate("prisma", prisma);

server.addHook("onClose", async () => {
	await prisma.$disconnect();
});

server.get("/", async (req, res) => {
	const userCount = await prisma.user.count();
	res.send(
		userCount == 0
			? "No users have been added yet."
			: "Some users have been added to the database.",
	);
});

const { JWT_SECRET, COOKIE_SECRET } = requireEnvs([
	"JWT_SECRET",
	"COOKIE_SECRET",
] as const);
await server.register(jwt, { secret: JWT_SECRET });
await server.register(cookie, { secret: COOKIE_SECRET });

server.register(userRoutes, { prefix: "api/users" });

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
