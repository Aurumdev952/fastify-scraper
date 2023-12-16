import { FastifyInstance, errorCodes } from "fastify";
import scrapController from "./controller/scrapController";

export default async function router(fastify: FastifyInstance) {
  fastify.register(scrapController, { prefix: "/items" });
  fastify.setErrorHandler(function (error, request, reply) {
    this.log.error(error)
    if (error instanceof errorCodes.FST_ERR_BAD_STATUS_CODE) {
      this.log.error(error)
      // Log error
      // Send error response
      reply.status(500).send({ ok: false })
    } else {
      // fastify will use parent error handler to handle this
      reply.send(error)
    }
  })
}
