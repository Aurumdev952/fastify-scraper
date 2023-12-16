import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { load } from "cheerio";

const baseUrl = "https://scrapeme.live/shop";

interface ListItem {
  name: string | undefined;
  image: string | undefined;
  link: string | undefined;
}

interface Item {
  name: string | undefined;
  image: string | undefined;
  description: string | undefined;
}

interface QueryType {
  page: string | undefined;
  orderBy: string | undefined;
}

function urlBuilder(query: QueryType): string {
  let url = baseUrl;
  if (query.page) {
    url += "/page/" + query.page;
  }
  if (query.orderBy) {
    url += "/?orderBy=" + query.orderBy;
  }

  return url;
}

export default async function scrapController(fastify: FastifyInstance) {
  // GET /
  fastify.get(
    "/",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      const query = _request.query as QueryType;

      const url = urlBuilder(query);
      const res = await axios.get(url);
      console.log(res.status);
      const $ = load(res.data);
      const items: ListItem[] = [];
      const list = $("#main > ul");
      list.children().each((i, el) => {
        items.push({
          // image: $(el)
          link: $(el).find("a").attr("href"),
          image: $(el).find("img").attr("src"),
          name: $(el).find("h2").text(),
        });
      });
      reply.status(200).send(items);
    }
  );

  fastify.get(
    "/one/:name",
    async function (_request: FastifyRequest, reply: FastifyReply) {
      try {
        const { name } = _request.params as { name: string };
        const res = await axios.get(baseUrl + "/" + name, {
          timeout: 1000 * 60 * 3
        });

        const $ = load(res.data);

        const main = $("#main");
        const item: Item = {
          image: $(main).find("div.woocommerce-product-gallery.woocommerce-product-gallery--with-images.woocommerce-product-gallery--columns-4.images > figure > div").attr("data-thumb"),
          name: $(main).find("h1").text(),
          description: $(main)
            .find(
              "div.summary.entry-summary > div.woocommerce-product-details__short-description > p"
            )
            .text(),
        };
        reply.status(200).send(item);
      } catch (error) {
        console.log(error);
        reply.status(500);
      }
    }
  );
}
