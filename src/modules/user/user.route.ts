import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

// @ts-ignore
import type { PrismaClient } from "../../../generated/prisma_client/client";

import bcrypt from "bcryptjs";

import type { LoginRequest, RegisterRequest } from "./user.models.js";

declare module "fastify" {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}

export async function userRoutes(app: FastifyInstance) {
	app.get("/", (req: FastifyRequest, res: FastifyReply) => {
		res.send({ message: "/ route hit" });
	});

	app.post(
		"/register",
		{
			preHandler: [
				async (
					req: FastifyRequest<{ Body: RegisterRequest }>,
					rep: FastifyReply,
				) => {
					const existing = await app.prisma.user.findUnique({
						where: { email: req.body.email },
						select: { id: true },
					});

					if (existing) {
						return rep
							.code(409)
							.send({ ok: false, error: "USER_ALREADY_EXIST" });
					}
				},
				async (req: FastifyRequest<{ Body: RegisterRequest }>) => {
					req.body.password = await bcrypt.hash(
						req.body.password,
						12,
					);
				},
			],
		},
		async (
			req: FastifyRequest<{ Body: RegisterRequest }>,
			rep: FastifyReply,
		) => {
			const data = req.body;

			const user = await app.prisma.user.create({
				data: {
					email: data.email,
					password: data.password,
					name: data.name,
				},
				select: { id: true, email: true, name: true },
			});

			const token = app.jwt.sign(
				{ userId: user.id, email: user.email },
				{ expiresIn: "1h" },
			);

			return rep
				.code(201)
				.send({
					ok: true,
					access_token: token,
					user: { id: user.id, email: user.email, name: user.name },
				});
		},
	);

	app.post(
		"/login",
		async (
			req: FastifyRequest<{ Body: LoginRequest }>,
			rep: FastifyReply,
		) => {
			const data = req.body;

			const user = await app.prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true, password: true, email: true, name: true },
			});

			if (!user)
				return rep
					.code(401)
					.send({ ok: false, error: "INVALID_CREDENTIALS" });

			const ok = await bcrypt.compare(data.password, user.password);
			if (!ok)
				return rep
					.code(401)
					.send({ ok: false, error: "INVALID_PASSWORD" });

			const token = app.jwt.sign(
				{ userId: user.id, email: user.email },
				{ expiresIn: "1h" },
			);

			return rep.send({
				ok: true,
				access_token: token,
				user: { id: user.id, email: user.email, name: user.name },
			});
		},
	);

	app.delete("/logout", async (_req, rep) => {});

	app.log.info("user routes registered");
}
